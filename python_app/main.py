from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import uvicorn
import os
from pathlib import Path

from database import engine, get_db, create_tables, Base
import crud
import schemas

# Crear las tablas
create_tables()

app = FastAPI(
    title="Sistema de Lavado Peña Blanca",
    description="Sistema completo de gestión para carwash",
    version="2.0.0"
)

# Servir archivos estáticos del frontend
if os.path.exists("client/dist"):
    app.mount("/assets", StaticFiles(directory="client/dist/assets"), name="assets")
    app.mount("/static", StaticFiles(directory="client/dist"), name="static")

# Rutas de la API

# Dashboard
@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)

# Products
@app.get("/api/inventory", response_model=list[schemas.Product])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

@app.post("/api/inventory", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

@app.get("/api/inventory/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@app.put("/api/inventory/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    updated_product = crud.update_product(db, product_id, product)
    if not updated_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return updated_product

@app.delete("/api/inventory/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    deleted_product = crud.delete_product(db, product_id)
    if not deleted_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"message": "Producto eliminado correctamente"}

# Services
@app.get("/api/services", response_model=list[schemas.Service])
def get_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_services(db, skip=skip, limit=limit)

@app.post("/api/services", response_model=schemas.Service)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    return crud.create_service(db, service)

@app.get("/api/services/{service_id}", response_model=schemas.Service)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = crud.get_service(db, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return service

@app.put("/api/services/{service_id}", response_model=schemas.Service)
def update_service(service_id: int, service: schemas.ServiceUpdate, db: Session = Depends(get_db)):
    updated_service = crud.update_service(db, service_id, service)
    if not updated_service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return updated_service

@app.delete("/api/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    deleted_service = crud.delete_service(db, service_id)
    if not deleted_service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return {"message": "Servicio eliminado correctamente"}

# Customers
@app.get("/api/crm/customers", response_model=list[schemas.Customer])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_customers(db, skip=skip, limit=limit)

@app.post("/api/crm/customers", response_model=schemas.Customer)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db, customer)

@app.get("/api/crm/customers/{customer_id}", response_model=schemas.Customer)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = crud.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return customer

@app.put("/api/crm/customers/{customer_id}", response_model=schemas.Customer)
def update_customer(customer_id: int, customer: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    updated_customer = crud.update_customer(db, customer_id, customer)
    if not updated_customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return updated_customer

@app.delete("/api/crm/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    deleted_customer = crud.delete_customer(db, customer_id)
    if not deleted_customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"message": "Cliente eliminado correctamente"}

@app.get("/api/crm/customers/top", response_model=list[schemas.Customer])
def get_top_customers(limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_top_customers(db, limit=limit)

# Appointments
@app.get("/api/appointments", response_model=list[schemas.Appointment])
def get_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_appointments(db, skip=skip, limit=limit)

@app.post("/api/appointments", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    return crud.create_appointment(db, appointment)

@app.get("/api/appointments/{appointment_id}", response_model=schemas.Appointment)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return appointment

@app.put("/api/appointments/{appointment_id}", response_model=schemas.Appointment)
def update_appointment(appointment_id: int, appointment: schemas.AppointmentUpdate, db: Session = Depends(get_db)):
    updated_appointment = crud.update_appointment(db, appointment_id, appointment)
    if not updated_appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return updated_appointment

@app.delete("/api/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    deleted_appointment = crud.delete_appointment(db, appointment_id)
    if not deleted_appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return {"message": "Cita eliminada correctamente"}

# Invoices
@app.get("/api/invoices", response_model=list[schemas.Invoice])
def get_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_invoices(db, skip=skip, limit=limit)

@app.post("/api/invoices", response_model=schemas.Invoice)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(get_db)):
    return crud.create_invoice(db, invoice)

@app.get("/api/invoices/{invoice_id}", response_model=schemas.Invoice)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = crud.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return invoice

@app.put("/api/invoices/{invoice_id}", response_model=schemas.Invoice)
def update_invoice(invoice_id: int, invoice: schemas.InvoiceUpdate, db: Session = Depends(get_db)):
    updated_invoice = crud.update_invoice(db, invoice_id, invoice)
    if not updated_invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return updated_invoice

@app.delete("/api/invoices/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    deleted_invoice = crud.delete_invoice(db, invoice_id)
    if not deleted_invoice:
        raise HTTPException(status_code=404, detail="Factura no encontrada")
    return {"message": "Factura eliminada correctamente"}

# Endpoint para promociones (mantenido para compatibilidad)
@app.get("/api/crm/promotions")
def get_promotions():
    return []

# Inicialización de datos de ejemplo
@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    crud.init_sample_data(db)
    print("🔧 Inicializando Sistema de Lavado Peña Blanca (Python)...")
    print("✅ Base de datos configurada correctamente")
    print("🌐 Sistema de Lavado Peña Blanca - ACTIVO (Python)")
    print("📊 Base de datos conectada y funcionando")
    print("🔗 Acceso web: http://localhost:8001")

# Servir el frontend React
@app.get("/")
def serve_frontend():
    if os.path.exists("client/dist/index.html"):
        return FileResponse("client/dist/index.html")
    else:
        return {"message": "Sistema de Lavado Peña Blanca API - Python Version", "docs": "/docs"}

# Catch-all para el frontend (para routing del SPA)
@app.get("/{full_path:path}")
def serve_frontend_routes(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    if os.path.exists("client/dist/index.html"):
        return FileResponse("client/dist/index.html")
    else:
        raise HTTPException(status_code=404, detail="Page not found")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )