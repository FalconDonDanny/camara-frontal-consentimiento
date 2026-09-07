from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("camara/", views.camera, name="camera"),
    path("contacto/", views.contact, name="contact"),
]
