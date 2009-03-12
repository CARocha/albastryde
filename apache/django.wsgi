import os, sys

topdir='/home/jwilm'
sys.path.append(topdir)
sys.path.append(topdir+'/albastryde')
sys.path.append(topdir+'/albastryde/wiki')
os.environ['DJANGO_SETTINGS_MODULE'] = 'albastryde.settings'
os.environ['MPLCONFIGDIR'] = topdir+"/albastryde/media/cache/" 
import django.core.handlers.wsgi

application = django.core.handlers.wsgi.WSGIHandler()
