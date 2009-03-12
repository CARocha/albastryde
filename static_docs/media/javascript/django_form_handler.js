function beforeForm() { 
	$('#AjaxFormSubmit').attr("disabled","disabled"); //Disable the submit button - can't click twice
	$('.errorlist').remove(); //Get rid of any old error uls
	//$('#AjaxFormWarning').fadeOut('slow'); //Get rid of the main error message
	$('#AjaxFormWarning').html("<img src=\"/media/icons/ajax-loader.gif\" />").fadeIn('slow');
	$("#AjaxFormWarning").ajaxError(function(){
		$(this).html("Hay problemas con el red!").fadeIn('slow');		
		$('#AjaxFormSubmit').attr("disabled","");

	});
	return true; //Might not need this...
}

var e_msg,errors;
//var datapoint_dictionary,comments;
function processJson(jsondata) { 
	var query_id,id,cordobagraphs,headline,commentCounter,has_comments,plot,comment_form_open,comments,datapoint_dictionary,graph_height,graph_margin_bottom;
	comment_form_open=false;
	if($.browser.msie){
		$("div.graph").remove();
	}



function calculate_currencygraphs(currency_dic,cordobagraphs) { 
		var new_graphs,label,data,currency_data,new_data,unit,time,new_unit,cordoba,currency,currency_value;
		new_graphs=[];
		$.each(cordobagraphs,function() {
			label=this['label'];
			data=this['data'];
			unit=this['unit'];
			if (unit=='cordoba') {
				currency_data=[];
				$.each(data,function() {
					time=this[0];
					cordoba=this[1];
					pk=this[2];
					currency=currency_dic[String(time)];
					currency_value = parseFloat(cordoba) * parseFloat(currency);
					currency_data.push([time,currency_value,pk]);
				});

				current_data=currency_data;
				current_unit=currency_dic['unit'];
			} else {
				current_data=data;
				current_unit=unit;
			}
			new_graphs.push({'label':label,'data':current_data,'unit':current_unit});
		});
		return new_graphs.sort();
}

function calculate_normalizedgraphs(unitgraphs) {
                var new_graphs,label,new_label,data,new_data,unit,time,start_value,unit_value,normalized_value;
                new_graphs=[];
                $.each(unitgraphs,function() {
                        label=this['label'];
                        data=this['data'];
                        unit=this['unit'];
			start_value=data[0][1];
			new_label=label+" (1 = "+String(start_value)+" "+unit+"s)";
			new_data=[];
			$.each(data,function() {
				time=this[0];
				unit_value=this[1];
				pk=this[2];
				normalized_value=parseFloat(unit_value)/parseFloat(start_value);
				new_data.push([time,normalized_value,pk]);
			});
			new_graphs.push({'label':new_label,'data':new_data,'unit':'normalized'});
		});
		return new_graphs.sort();
}
            function makeLabelCanvas(width, height) {
                var c = document.createElement('canvas');
                c.width = width;
                c.height = height;
		c.id= query_id+'labelcanvas';
                if ($.browser.msie) { // excanvas hack
                    c = window.G_vmlCanvasManager.initElement(c);
		} 
               return c;
            }
var labelCanvas=false;
function drawPoint(ctx,x,y,radius,fillStyle,plotOffset,dataitem,series) {
unique_pk=dataitem[2];
if (eval(has_comments) && unique_pk in comments) {
	if (!(labelCanvas)) {
		var canvasHeight= $('#'+query_id+'stats canvas:first').outerHeight();
		var canvasWidth= $('#'+query_id+'stats canvas:first').outerWidth();
	        var canvas =$(makeLabelCanvas(canvasWidth,canvasHeight)).css({ position: 'absolute', left: 0, top: 0 }).insertAfter('#'+query_id+'stats canvas:first').get(0);
		labelCanvas = canvas.getContext("2d");
		labelCanvas.translate(plotOffset.left, plotOffset.top);
		labelCanvas.lineWidth=ctx.lineWidth;
	}
	labelCanvas.strokeStyle=ctx.strokeStyle;
	ctx.zIndex=2;
        labelCanvas.beginPath();

	labelCanvas.arc(x, y, radius*3, 0, 2 * Math.PI, true);
	var seconddigit = commentCounter%26;
	var firstdigit = Math.floor(commentCounter/26);
	if (firstdigit > 26) {
		firstdigit = firstdigit%26;
	}
	var label ='';
	if (firstdigit > 0) {
		label+= String.fromCharCode(firstdigit+96);
	}
        label+= String.fromCharCode(seconddigit+97);
	commentCounter+=1;
	var comments_text="";
	for (var comment_pk in comments[unique_pk]) {
		if (comments[unique_pk][comment_pk][3]===true) {
			comments_text+='<div class="publicComment">';
		} else {	
			comments_text+='<div class="nonpublicComment">';
		}
		if (comments[unique_pk][comment_pk][2]===true) {
			comments_text+='<p class="editline"><span class="editlink" id="'+unique_pk+'+'+comment_pk+'+'+query_id+'">Editar</span></p>';
		}
		comments_text+="<p>"+comments[unique_pk][comment_pk][0]+"</p>";
		comments_text+="<p class=\"signature\">"+comments[unique_pk][comment_pk][1]+"</p>";
		comments_text+='</div>';
	}

	$("#"+query_id+"comments").append("<tr class=\"comment\" id=\""+query_id+"_"+unique_pk+"comments\"><td valign=\"top\"><b>"+label+"</b></td><td valign=\"top\">"+comments_text+"</td></tr>");
        $('<div class="pointLabel" id="'+query_id+'_'+unique_pk+'label">'+label+'</div>').insertAfter('#'+query_id+'labelcanvas');
	var editButtons = $('#'+query_id+'_'+unique_pk+'comments p.editline span.editlink');
	editButtons.bind("click", function(){
	  if (!(comment_form_open)) {
//	    comment_form_open=true;
	    total_pk=$(this).attr('id').split('+');
	    this_unique_pk=total_pk[0];
	    this_comment_pk=total_pk[1];
//	    alert( $(this).text() +" "+unique_pk + " " + this_unique_pk +" "+ this_comment_pk);
	    create_comment_form(this_unique_pk,this_comment_pk);
	  }
	});
	var pointDiv = $('#'+query_id+'_'+unique_pk+'label');
	var labelwidth= pointDiv.outerWidth();
	var leftOffset = plotOffset.left - (labelwidth/2) +0.5;
	pointDiv.css({
            top: y,
            left: leftOffset +x
          });
        if (fillStyle) {
                        labelCanvas.fillStyle = fillStyle;
                        labelCanvas.fill();
        }

	labelCanvas.stroke();
} else {
	ctx.zIndex=1;
	ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
                    if (fillStyle) {
                        ctx.fillStyle = fillStyle;
                        ctx.fill();
                    }
	ctx.stroke();        
}
}

function create_comment_form(unique_pk,comment_pk) {
  var comment;
  comment_form_open=true;
  timestamp=parseInt(new Date().getTime().toString().substring(0, 10));
  if (comment_pk) {
//    var comment_text=comments[unique_pk][comment_pk];
    var comment_text=comments[unique_pk][comment_pk][0];
    var comment_author=comments[unique_pk][comment_pk][1];
  }
  var label = datapoint_dictionary[unique_pk][3];
  if (label.length===0) {
    label='producto';
  }
  var value = datapoint_dictionary[unique_pk][1];
  var raw_date = datapoint_dictionary[unique_pk][0];
  var date = new Date(raw_date).toDateString();

  var s = '';
  s += '<div class="formDiv" id="'+query_id+'formDiv">';
if (comment_pk) {
  s += '  <strong>Editar Comentario</strong><br /><br />';
  } else {
  s += '  <strong>Nuevo Comentario</strong><br /><br />';
  }
  s += '  <strong>'+label+': '+value+' ('+date+')</strong><br /><br />';
  s += '  <form name="newcomment" id="'+query_id+'newcomment" method="post">';
  if (comment_pk) {
    s += '  <input type="hidden" name="comment_pk" id="'+query_id+'comment_pk" value="'+comment_pk+'">';
  }
  s += '  <input type="hidden" name="timestamp" id="'+query_id+'timestamp_field" value="'+timestamp+'">';
  s += '  <input type="hidden" name="honeypot" id="'+query_id+'honeypot_field" value="">';
  s += '  <textarea id="'+query_id+'comment_field" name="comment" rows="10" cols="40" name="comment" class="vLargeTextField">';
  if (comment_text) {
    s += comment_text;
  }
  s += '</textarea>';
  s += '  <div id ="'+query_id+'formDivMessage">&nbsp;</div>';
  s += '  <input type="button" name="btnSave" id="'+query_id+'btnSave" value="Guardar"><input type="button" name="btnCancel" id="'+query_id+'btnCancel" value="Cancelar">';
  if (comment_pk) {
    s += '  <input type="button" name="btnDelete" id="'+query_id+'btnDelete" value="Borrar">';
  }
  s += '  </form>';
  s += '</div>';
  pk_array=unique_pk.split('_');
  content_type = pk_array[0];
  object_pk = pk_array[1];
  $("#"+query_id).append(s);
  $("#"+query_id+"btnSave").unbind(); // so other form doesn't get submitted
  formInfo = "";
  $("#"+query_id+"btnCancel").click(function(){
   $("#"+query_id+"formDivMessage").html('Cancelando...');
   $("#"+query_id+"formDiv").fadeOut(300, function() { $(this).remove(); });
   comment_form_open= false;
  });
  if (comment_pk) {
  $("#"+query_id+"btnDelete").click(function(){
    formInfo = {
      object_pk : object_pk,
      content_type : content_type,
      remove : true,
      comment_pk: comment_pk
    };
    formInfo.timestamp = $("#"+query_id+"timestamp_field").val();
    formInfo.honeypot = $("#"+query_id+"honeypot_field").val();
    returnFormResponse(formInfo,'Borrando...','Borrado con exito!');
  });

  }
  $("#"+query_id+"btnSave").click(function(){
    comment = $("#"+query_id+"comment_field").val();
    formInfo = {
      object_pk : object_pk,
      content_type : content_type,
      comment : comment
    };
    if (comment_pk) {
	formInfo.comment_pk = comment_pk;
    }
    formInfo.timestamp = $("#"+query_id+"timestamp_field").val();
    formInfo.honeypot = $("#"+query_id+"honeypot_field").val();
    returnFormResponse(formInfo,'Guardando...','Guardado con exito!');
  });
  function returnFormResponse(fI,processMessage,successMessage){
   $("#"+query_id+"btnSave").attr('disabled', 'disabled');
   $("#"+query_id+"btnDelete").attr('disabled', 'disabled');
   $("#"+query_id+"formDivMessage").html(processMessage);
   $.post('/ajax/comment/post/',fI,function(data) {
	if (data.status == "success") {
	    if ('remove' in data) {
	    	delete comments[unique_pk][data.pk];
		var datapoint_comments_length=0;
		for (var k in comments[unique_pk]) {
			datapoint_comments_length++;
		}
		if (datapoint_comments_length===0) {
			delete comments[unique_pk];
		}
	    } else {
	        if (!(unique_pk in comments)) {
		    comments[unique_pk]={};
		    has_comments=true;
	        }
	        comments[unique_pk][data.pk]=[comment,user_name,true,data.public];
            }
	    redraw_graph();
	$("#"+query_id+"formDivMessage").html(successMessage);
	$("#"+query_id+"formDiv").fadeOut(300, function() { $(this).remove(); });
	comment_form_open= false;
	} else {
	$("#"+query_id+"formDivMessage").html('Hubo un error!');	
	$("#"+query_id+"btnSave").attr('disabled', '');
	$("#"+query_id+"btnDelete").attr('disabled', '');
	}
    // The success or failure check will go here. . .
   }, "json");
  }
}
graph_margin_bottom=0;
function correct_graphheight() {
	var comments_height;
	comments_height=$("#"+query_id+"comments").height();
	if (comments_height > graph_height) {
		graph_margin_bottom = comments_height - graph_height;
		$("#"+query_id).css('margin-bottom', graph_margin_bottom +'px');
	} else if (graph_margin_bottom > 0) {
		graph_margin_bottom = 0;
		$("#"+query_id).css('margin-bottom',0);
	}
}
function reset_comments() {
	labelCanvas=false;
	commentCounter=0;
	$("#"+query_id+" tr.comment").remove();
	$("#"+query_id+"labelcanvas").remove();
	$("#"+query_id+" div.pointLabel").remove();
}
function redraw_graph() {
        reset_comments();
	plot.draw();
        correct_graphheight();
}
function calculate_datapoint_dictionary(graphs) {
	var new_datapoint_dictionary={};
	for (var series = 0; series < graphs.length; ++series) {
		for (var datapoint =0; datapoint < graphs[series]['data'].length; ++datapoint) {
			new_datapoint_dictionary[graphs[series]['data'][datapoint][2]]=[graphs[series]['data'][datapoint][0],graphs[series]['data'][datapoint][1],graphs[series]['unit'],graphs[series]['label']];
		}
	}
	return new_datapoint_dictionary;
}
function make_graphs(graphs) {
	reset_comments(); 
	//first unbind all earlier bindings
	$("#"+query_id+"stats").unbind("plotselected");
	$("#"+query_id+"statsoverview").unbind("plotselected");
	$("img#"+query_id+"reset").unbind("click");		
	var options,overview;
	options = { xaxis: { mode: "time", minTickSize: [1, "day"] },
		lines: { show: true },
		legend: { container: "#"+query_id+"legend"},
        	points: { show: true, drawCall:drawPoint },
		selection: { mode: "xy" } };
	if (user_logged_in) {
		options['grid']={ hoverable: true, clickable: true };
	}
	plot=$.plot($("#"+query_id+"stats"), graphs,options);
        overview = $.plot($("#"+query_id+"statsoverview"), graphs, {
        	lines: { show: true, lineWidth: 1 },
		legend: { show: false },
        	shadowSize: 0,
        	xaxis: { ticks: [], mode: "time" },
        	yaxis: { ticks: []},
        	selection: { mode: "xy" }
    	});
	graph_height=$("#"+query_id).height();
	correct_graphheight();
    	$("#"+query_id+"stats").bind("plotselected", function (event, ranges) {
		reset_comments();
      	// clamp the zooming to prevent eternal zoom
        	if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
	        	    ranges.xaxis.to = ranges.xaxis.from + 0.00001;
		}
        	if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
	        	    ranges.yaxis.to = ranges.yaxis.from + 0.00001;
		}
	        // do the zooming
	        plot = $.plot($("#"+query_id+"stats"), graphs,
                      $.extend(true, {}, options, {
                          xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                          yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
                      }));
        	// don't fire event on the overview to prevent eternal loop
        	overview.setSelection(ranges, true);
		correct_graphheight();
    	});
    	$("#"+query_id+"statsoverview").bind("plotselected", function (event, ranges) {
		reset_comments();
        	plot.setSelection(ranges);
		correct_graphheight();
    	});	
	$("img#"+query_id+"reset").click(function() {		
		reset_comments();
		plot=$.plot($("#"+query_id+"stats"), graphs,options);
		overview.clearSelection();
		correct_graphheight();
	});
	$("#"+query_id+"stats").bind("plotclick", function (event, pos, item) {
        if ((item) && (!(comment_form_open))) {
//	    var theDate = new Date(item.datapoint[0]); 
//	    var date = theDate.toDateString(); 
//	    var label=item.series.label;
//	    if (label.length===0) {
//		label='producto';
//	    }
//	    create_comment_form(item.datapoint[2],label,item.datapoint[1],date);
	    create_comment_form(item.datapoint[2]);
        }
    });


}

	//Do we have any data at all?
	if (jsondata) {
		e_msg = "We received your form, thank you.";
		if (eval(jsondata.bad)) {
			e_msg = "Please check your form.";
			errors = eval(jsondata.errs); //Again with the eval :)
			$.each(errors,function(fieldname,errmsg)
			{
				id = "#id_" + fieldname;
				$(id).parent().after( errmsg ); //I want the error above the <p> holding the field
				});
		} else {
		if (jsondata.comments) {
			comments=jsondata.comments;
			has_comments=true;
		} else {
			comments={};
			has_comments=false;
		}
		cordobagraphs=eval(jsondata.graphs).sort();
		if (cordobagraphs.length===0) {
			e_msg = "No hay datos para la seleccion!";
			$('#AjaxFormWarning').text( e_msg ).fadeIn("slow");
			$('#AjaxFormSubmit').attr("disabled","");
			return true;
		} 
		datapoint_dictionary=calculate_datapoint_dictionary(cordobagraphs);
		headline=jsondata.headline;

		query_id=String(new Date().getTime());
		var graph_margin='';
		var comment_list='';
		if (eval(has_comments) || eval(user_can_add)) {
			graph_margin="200";
			comment_list="<table id=\""+query_id+"comments\" style=\"width:200px; position:absolute;right:0;top:0;\"><tr>";
			comment_list+="<th style=\"width:15px;\">&nbsp;</th><th style=\"width:185px;\">Comentarios</th></tr></table>";			
		}
		var graph_html="";
		graph_html+="<div id=\""+query_id+"\" class=\"graph\" style=\"position:relative;\"><h2 id=\""+query_id+"headline\">"+headline+"</h2>";
                graph_html+="<div id=\""+query_id+"stats\" style=\"height:400px; margin-right:"+graph_margin+"px;\"></div>";
		graph_html+=comment_list;
		graph_html+="<div id=\""+query_id+"statsoverview\" style=\"height:50px; margin-right:"+graph_margin+"px;\"></div>";
                graph_html+="<img id=\""+query_id+"reset\" src=\"/media/icons/reset.png\" />";
		graph_html+="<select id=\""+query_id+"xunits\" class=\""+query_id+"graphkind\"><option selected=\"selected\" value=\"cordobas\">Cordobas</option><option value=\"dollars\">USD</option><option value=\"euros\">Euros</option></select>";
		graph_html+="<select id=\""+query_id+"xtype\" class=\""+query_id+"graphkind\">";
                graph_html+="<option selected=\"selected\" value=\"real\">Real</option>";
                graph_html+="<option value=\"normalized\">Normalizado</option></select>";
                graph_html+="<div id=\""+query_id+"legend\" style=\"margin-right:"+graph_margin+"px;\"></div></div>";
		$("#GraphsHeader").after(graph_html);
		
		make_graphs(cordobagraphs);
		e_msg = "Nuevo grafico generado.";

		//Show the message
		$('#AjaxFormWarning').text( e_msg ).fadeIn("slow");

		//Calculate other graphs	
		var dollargraphs=calculate_currencygraphs(eval(jsondata.dollar),cordobagraphs);
		var eurographs=calculate_currencygraphs(eval(jsondata.euro),cordobagraphs);
		var normalizedcordobagraphs=calculate_normalizedgraphs(cordobagraphs);
		var normalizeddollargraphs=calculate_normalizedgraphs(dollargraphs);
		var normalizedeurographs=calculate_normalizedgraphs(eurographs);


		$("select."+query_id+"graphkind").change(function() {
//			xunits='euros';
//			xtype='normalized';
			var xunits = $("select#"+query_id+"xunits").val();
			var xtype = $("select#"+query_id+"xtype").val();
                        if ( xunits == 'cordobas' && xtype == 'real' ) {
                                make_graphs(cordobagraphs);
                        } else if ( xunits == 'dollars' && xtype == 'real' ) {
                                make_graphs(dollargraphs);
                        } else if ( xunits == 'euros' && xtype == 'real' ) {
                                make_graphs(eurographs);
                        } else if ( xunits == 'cordobas' && xtype == 'normalized' ) {
                                make_graphs(normalizedcordobagraphs);
                        } else if ( xunits == 'dollars' && xtype == 'normalized' ) {
                                make_graphs(normalizeddollargraphs);
                        } else if ( xunits == 'euros' && xtype == 'normalized' ) {
                                make_graphs(normalizedeurographs);
                        } else {
                                make_graphs(cordobagraphs);
                        }	
		});

	}} else {
		//DON'T PANIC :D
		$('#AjaxFormWarning').text("Ajax error : no data received. ").fadeIn("slow");
	}
	// re-enable the submit button, coz user has to fix stuff.
	$('#AjaxFormSubmit').attr("disabled","");


}

$(document).ready(function() { 
	// prepare Options Object 
	var options = { 
	url: '.', // Here we pass the xhr flag
        dataType:  'json', 
	success:   processJson, //What to call after a reply from Django
	beforeSubmit: beforeForm
	};
    // bind form using ajaxForm 
    $('#AjaxForm').ajaxForm(options); //My form id is 'AjaxForm'
});
