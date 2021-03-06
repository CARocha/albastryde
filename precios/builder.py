# -*- coding: utf-8 -*-
from precios.models import Prueba as PrecioPrueba
#from precios.models import Mercado
from valuta.models import USD,Euro
import datetime
from calendar import monthrange
from time import mktime
from django.db import connection
from django.contrib.contenttypes.models import ContentType

def content_type():
	return ContentType.objects.get(app_label__exact='precios', name__exact='prueba').id

def precio_builder(form_data,frequencies):
	pk_list=[]
	graphs=[]
	dollar={}
	euro={}
	mercados = form_data['PreciosMercado']	
	productos = form_data['PreciosProducto']
	start_date = form_data['Desde']
	end_date = form_data['Hasta']
	municipios = form_data['LugarMunicipio']
	departamentos = form_data['LugarDepartamento']
	medida_tipo = form_data['PreciosMedida']

	if len(productos) > 0:		
		for departamento in departamentos:
	  		if len(departamento.municipios.all()) > 0:
		  		if len(municipios) > 0:
					municipios = municipios | departamento.municipios.all()
				else:
			  		municipios = departamento.municipios.all()

		for municipio in municipios:
		  	if len(municipio.mercado_set.all()) > 0:
			  	if len(mercados) > 0:
					mercados = mercados | municipio.mercado_set.all()
				else:
				  	mercados = municipio.mercado_set.all()				  

		if len(mercados) > 0:
			dollar={'unit':'US$','monthly':{},'annualy':{},'daily':{}}
			euro={'unit':u'€','monthly':{},'annualy':{},'daily':{}}


		# Aqui se llaman la funcion para hacer cada uno de los graficos


			for frequency in frequencies:
				for mercado in mercados:
					for producto in productos:
						if medida_tipo=='mayor' or mercado.mayor==True and medida_tipo=='nativa':
							medida_unidad=producto.medida.medida_mayor
						else:
							medida_unidad=producto.medida.medida_menor
						if medida_tipo=='mayor' and mercado.mayor==False:
							factor=float(producto.medida.factor_para_convertir)
							action='multiply'						
						elif medida_tipo=='menor' and mercado.mayor==True:
							factor=float(producto.medida.factor_para_convertir)
							action='divide'
						else:
							factor=1
							action='nothing'
						graph,dollar,euro,pk_list=precio_graph(mercado=mercado,producto=producto,frequency=frequency,start_date=start_date,end_date=end_date,dollar=dollar,euro=euro,pk_list=pk_list,factor=factor,action=action,medida_unidad=medida_unidad)
						if not graph==None:
							graphs.append(graph)

	return graphs,pk_list,dollar,euro



def add_month(datum, n=1):
	OneDay = datetime.timedelta(days=1)
	q,r = divmod(datum.month+n, 12)
	eom = datetime.date(datum.year+q, r+1, 1) - OneDay
	if datum.month != (datum+OneDay).month or datum.day >= eom.day:
        	return eom
	return eom.replace(day=datum.day)

def add_year(datum, n=1):
	if datum.month==2 and datum.day==monthrange(year=datum.year,month=2)[1]:
		return datetime.date(year=datum.year+n,month=2,day=monthrange(year+datum.year+n,month=2)[1])
	else:
		return datetime.date(year=datum.year+1,month=datum.month,day=datum.day)


	

def precio_graph(mercado,producto,frequency,start_date,end_date,dollar,euro,pk_list,factor,action,medida_unidad):
	queryset = None
	if frequency=='daily':
		queryset = PrecioPrueba.objects.filter(producto=producto,mercado=mercado,fecha__range=[start_date,end_date]).values('fecha','pk','maximo','minimo').order_by('fecha')
		source='raw'
	else:
		cursor = connection.cursor()
		if frequency=='monthly':
			cursor.execute("select producto_id as producto, mercado_id as mercado, date_trunc('month',fecha) as fecha, avg(maximo) as maximo, avg(minimo) as minimo from precios_prueba where producto_id = "+str(producto.pk)+" and mercado_id = "+str(mercado.pk)+" and fecha > '"+start_date.strftime('%Y-%m-%d')+"' and fecha < '"+end_date.strftime('%Y-%m-%d')+"' group by date_trunc('month',fecha), producto_id, mercado_id order by fecha;")
		elif frequency=='annualy':
			cursor.execute("select producto_id as producto, mercado_id as mercado, date_trunc('year',fecha) as fecha, avg(maximo) as maximo, avg(minimo) as minimo from precios_prueba where producto_id = "+str(producto.pk)+" and mercado_id = "+str(mercado.pk)+" and fecha > '"+start_date.strftime('%Y-%m-%d')+"' and fecha < '"+end_date.strftime('%Y-%m-%d')+"' group by date_trunc('year',fecha), producto_id, mercado_id order by fecha;")
		queryset=[]
		for row in cursor.fetchall():
			row_dic={'fecha':row[2],'maximo':row[3],'minimo':row[4],'producto':row[0],'mercado':row[1]}
			queryset.append(row_dic)
		source='computed'
	if len(queryset)==0:
		return None,dollar,euro,pk_list
	max_data=[]
	min_data_dic={}
	list_of_pk=[]
	for i in queryset:
		fecha=i['fecha']
		now_fecha=mktime(fecha.timetuple())
		if frequency=='daily':
			next_fecha=now_fecha+86399
		elif frequency=='monthly':
			next_fecha=mktime(add_month(fecha).timetuple())-1
		elif frequency=='annualy':
			next_fecha=mktime(add_year(fecha).timetuple())-1
		else:
			next_fecha=now_fecha
		precio=float(i['maximo'])		
		min_precio=float(i['minimo'])
		if action=='multiply':
			precio=float(precio*factor)
			min_precio=float(min_precio*factor)
		elif action=='divide':
			precio=float(precio/factor)
			min_precio=float(min_precio/factor)
		if precio != min_precio:
			min_data_dic[int(now_fecha)]=min_precio
		if not str(int(now_fecha)) in dollar[frequency]:
			if frequency=='daily':
				dollar[frequency][str(int(now_fecha))]=float(USD.objects.get(fecha__exact=i['fecha']).cordobas)
				euro[frequency][str(int(now_fecha))]=float(Euro.objects.get(fecha__exact=i['fecha']).cordobas)
			else:
				cursor = connection.cursor()
				if frequency=='monthly':
					cursor.execute("select avg(cordobas) from valuta_usd where date_trunc('month',fecha)='"+i['fecha'].strftime('%Y-%m-%d')+"';")
				elif frequency=='annualy':
					cursor.execute("select avg(cordobas) from valuta_usd where date_trunc('year',fecha)='"+i['fecha'].strftime('%Y-%m-%d')+"';")
				dollar[frequency][str(int(now_fecha))]= float(cursor.fetchone()[0])
				if frequency=='monthly':
					cursor.execute("select avg(cordobas) from valuta_euro where date_trunc('month',fecha)='"+i['fecha'].strftime('%Y-%m-%d')+"';")
				elif frequency=='annualy':
					cursor.execute("select avg(cordobas) from valuta_euro where date_trunc('year',fecha)='"+i['fecha'].strftime('%Y-%m-%d')+"';")
				euro[frequency][str(int(now_fecha))]= float(cursor.fetchone()[0])				
		now_fecha=int(now_fecha)
		next_fecha=int(next_fecha)
		if frequency=='daily':
			unique_pk=str(content_type())+"_"+str(i['pk'])		
			list_of_pk.append(str(i['pk']))
#			max_data.append([now_fecha,precio,unique_pk])
			max_data.append([[now_fecha,next_fecha],precio,unique_pk])
		else:
#			max_data.append([now_fecha,precio])
			max_data.append([[now_fecha,next_fecha],precio])
	if frequency=='daily':
		pk_list.append([content_type(),list_of_pk])
	result={'included_variables':{'producto':producto.nombre,'mercado':mercado.nombre,'medida':medida_unidad},'unit':'C$','type':'precio','source':source,'frequency':frequency,'main_variable_js':'new_graph.included_variables.producto','place_js':'new_graph.included_variables.mercado','normalize_factor_js':'this.start_value','unit_legend_js':'new_graph.unit+"/"+new_graph.included_variables.medida+", "+_(new_graph.frequency)','display':'lines'}
	if len(min_data_dic)==0:
		result['data']=max_data
	else:
		result['data']=max_data
		result['min_data_dic']=min_data_dic
	return result,dollar,euro,pk_list

