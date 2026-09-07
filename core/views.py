from django.contrib import messages
from django.shortcuts import redirect, render


def home(request):
    return render(request, "core/home.html")


def camera(request):
    return render(request, "core/camera.html")


def contact(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        email = request.POST.get("email", "").strip()
        message = request.POST.get("message", "").strip()
        if name and email and message:
            messages.success(request, "Gracias. Hemos recibido tu mensaje.")
            return redirect("contact")
        messages.error(request, "Completa todos los campos para enviar el formulario.")
    return render(request, "core/contact.html")
