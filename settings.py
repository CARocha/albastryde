# -*- coding: utf-8 -*-

# Django settings for albastryde project.

WIKI_STARTPAGE = 'Información Agropecuaria MAGFOR' # Johannes Wilm's idea

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Johannes Wilm', 'j@indymedia.no'),
)

DEFAULT_CHARSET = 'utf-8'

MANAGERS = ADMINS

DATABASE_ENGINE = 'postgresql_psycopg2'           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
SEARCH_ENGINE = 'postgresql'           # 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
DATABASE_NAME = 'albastryde'             # Or path to database file if using sqlite3.
DATABASE_USER = 'albastryde'             # Not used with sqlite3.
DATABASE_PASSWORD = '6jm4G49l'         # Not used with sqlite3.
DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Managua'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'es-ni'

#GDAL_LIBRARY_PATH = 

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = '/home/jwilm/albastryde/media/'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = 'http://simasmedia.marx.su/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/adminmedia/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'ae7&gpgjfo3ze@!ym5u_%t*tg0f7lf1v1x1m-wi@@@l2^#wl3f'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.load_template_source',
    'django.template.loaders.app_directories.load_template_source',
#     'django.template.loaders.eggs.load_template_source',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
)

ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
#JINJA2_TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
"/home/jwilm/albastryde/templates",
)

INSTALLED_APPS = (
    'django_evolution',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
#    'django.contrib.markup',
    'django.contrib.admin',
#    'admin',
    'django.contrib.admindocs',
    'albastryde.wiki',
    'albastryde.precios',
    'albastryde.graph',
    'albastryde.valuta',
    'django.contrib.gis',
    'albastryde.mapa',
    'albastryde.lugar',
    'albastryde.climate',
    'albastryde.cosecha',
    'albastryde.lluvia',
    'django.contrib.comments',
    'albastryde.ajax_comments',
)


