from django.contrib import admin
from .models import College, Enquiry

@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'created_at']

@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'college', 'course', 'created_at']
    list_filter = ['college', 'course']