from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("camara/", views.camera, name="camera"),
    path("visor/", views.camera_viewer, name="camera-viewer"),
    path("contacto/", views.contact, name="contact"),
]
