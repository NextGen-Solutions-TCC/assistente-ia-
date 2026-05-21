from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required

@login_required
def google_login_callback(request):
    return redirect("http://localhost:5173/login-callback")

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/auth/', include('dj_rest_auth.urls')),
    
    path('accounts/', include('allauth.urls')),
    
    path('Api/', include('Api.urls')),

    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),

    path('password-reset/confirm/<uidb64>/<token>/', 
         TemplateView.as_view(template_name="index.html"), 
         name='password_reset_confirm'),

    path('accounts/profile/', google_login_callback),
]