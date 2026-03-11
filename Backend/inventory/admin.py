from django.contrib import admin
from .models import Fuel,InventoryTransaction,TankStorage,PriceHistory,FuelMotor

# Register your models here.
admin.site.register(Fuel)
admin.site.register(InventoryTransaction)
admin.site.register(TankStorage)
admin.site.register(PriceHistory)
admin.site.register(FuelMotor)
