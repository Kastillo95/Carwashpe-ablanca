from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, date
from typing import List, Optional
import json
import database
import schemas

def get_product(db: Session, product_id: int):
    return db.query(database.Product).filter(database.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = database.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = db.query(database.Product).filter(database.Product.id == product_id).first()
    if db_product:
        for key, value in product.dict(exclude_unset=True).items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = db.query(database.Product).filter(database.Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

def get_service(db: Session, service_id: int):
    return db.query(database.Service).filter(database.Service.id == service_id).first()

def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.Service).offset(skip).limit(limit).all()

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = database.Service(**service.dict())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: int, service: schemas.ServiceUpdate):
    db_service = db.query(database.Service).filter(database.Service.id == service_id).first()
    if db_service:
        for key, value in service.dict(exclude_unset=True).items():
            setattr(db_service, key, value)
        db.commit()
        db.refresh(db_service)
    return db_service

def delete_service(db: Session, service_id: int):
    db_service = db.query(database.Service).filter(database.Service.id == service_id).first()
    if db_service:
        db.delete(db_service)
        db.commit()
    return db_service

def get_customer(db: Session, customer_id: int):
    return db.query(database.Customer).filter(database.Customer.id == customer_id).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = database.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def update_customer(db: Session, customer_id: int, customer: schemas.CustomerUpdate):
    db_customer = db.query(database.Customer).filter(database.Customer.id == customer_id).first()
    if db_customer:
        for key, value in customer.dict(exclude_unset=True).items():
            setattr(db_customer, key, value)
        db.commit()
        db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = db.query(database.Customer).filter(database.Customer.id == customer_id).first()
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer

def get_appointment(db: Session, appointment_id: int):
    return db.query(database.Appointment).filter(database.Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.Appointment).offset(skip).limit(limit).all()

def get_appointments_by_date(db: Session, target_date: date):
    start_date = datetime.combine(target_date, datetime.min.time())
    end_date = datetime.combine(target_date, datetime.max.time())
    return db.query(database.Appointment).filter(
        and_(database.Appointment.date >= start_date, database.Appointment.date <= end_date)
    ).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    db_appointment = database.Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment: schemas.AppointmentUpdate):
    db_appointment = db.query(database.Appointment).filter(database.Appointment.id == appointment_id).first()
    if db_appointment:
        for key, value in appointment.dict(exclude_unset=True).items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int):
    db_appointment = db.query(database.Appointment).filter(database.Appointment.id == appointment_id).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

def get_invoice(db: Session, invoice_id: int):
    return db.query(database.Invoice).filter(database.Invoice.id == invoice_id).first()

def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(database.Invoice).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice: schemas.InvoiceCreate):
    # Generar número de factura único
    last_invoice = db.query(database.Invoice).order_by(database.Invoice.id.desc()).first()
    invoice_number = f"FAC-{(last_invoice.id + 1) if last_invoice else 1:06d}"
    
    db_invoice = database.Invoice(
        **invoice.dict(exclude={"items"}),
        invoice_number=invoice_number
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    # Agregar items
    for item in invoice.items:
        item_data = item.dict()
        item_data["total_price"] = item_data["quantity"] * item_data["unit_price"]
        db_item = database.InvoiceItem(invoice_id=db_invoice.id, **item_data)
        db.add(db_item)
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice(db: Session, invoice_id: int, invoice: schemas.InvoiceUpdate):
    db_invoice = db.query(database.Invoice).filter(database.Invoice.id == invoice_id).first()
    if db_invoice:
        for key, value in invoice.dict(exclude_unset=True).items():
            setattr(db_invoice, key, value)
        db.commit()
        db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: int):
    db_invoice = db.query(database.Invoice).filter(database.Invoice.id == invoice_id).first()
    if db_invoice:
        # Eliminar items primero
        db.query(database.InvoiceItem).filter(database.InvoiceItem.invoice_id == invoice_id).delete()
        db.delete(db_invoice)
        db.commit()
    return db_invoice

def get_dashboard_stats(db: Session):
    today = date.today()
    start_of_today = datetime.combine(today, datetime.min.time())
    end_of_today = datetime.combine(today, datetime.max.time())
    
    # Citas de hoy
    today_appointments = db.query(database.Appointment).filter(
        and_(database.Appointment.date >= start_of_today, database.Appointment.date <= end_of_today)
    ).count()
    
    # Ingresos del día
    daily_revenue = db.query(func.sum(database.Invoice.total)).filter(
        and_(
            database.Invoice.date >= start_of_today,
            database.Invoice.date <= end_of_today,
            database.Invoice.status == "pagada"
        )
    ).scalar() or 0.0
    
    # Total de clientes
    total_customers = db.query(database.Customer).count()
    
    # Productos con stock bajo
    low_stock_products = db.query(database.Product).filter(
        database.Product.stock <= database.Product.min_stock
    ).count()
    
    # Ingresos del mes
    start_of_month = datetime(today.year, today.month, 1)
    monthly_revenue = db.query(func.sum(database.Invoice.total)).filter(
        and_(
            database.Invoice.date >= start_of_month,
            database.Invoice.status == "pagada"
        )
    ).scalar() or 0.0
    
    # Citas completadas del día
    completed_appointments = db.query(database.Appointment).filter(
        and_(
            database.Appointment.date >= start_of_today,
            database.Appointment.date <= end_of_today,
            database.Appointment.status == "completada"
        )
    ).count()
    
    # Citas pendientes del día
    pending_appointments = db.query(database.Appointment).filter(
        and_(
            database.Appointment.date >= start_of_today,
            database.Appointment.date <= end_of_today,
            database.Appointment.status == "programada"
        )
    ).count()
    
    # Total de productos y servicios
    total_products = db.query(database.Product).count()
    total_services = db.query(database.Service).count()
    
    return schemas.DashboardStats(
        todayAppointments=today_appointments,
        dailyRevenue=daily_revenue,
        totalCustomers=total_customers,
        lowStockProducts=low_stock_products,
        monthlyRevenue=monthly_revenue,
        completedAppointments=completed_appointments,
        pendingAppointments=pending_appointments,
        totalProducts=total_products,
        totalServices=total_services
    )

def get_top_customers(db: Session, limit: int = 10):
    return db.query(database.Customer).order_by(database.Customer.total_spent.desc()).limit(limit).all()

def init_sample_data(db: Session):
    """Inicializar datos de ejemplo si la base de datos está vacía"""
    
    # Verificar si ya hay datos
    if db.query(database.Product).first():
        return
    
    # Productos de ejemplo
    sample_products = [
        {"name": "Champú para Auto Premium", "description": "Champú concentrado para lavado exterior", "price": 25.00, "cost": 15.00, "stock": 50, "min_stock": 10, "category": "Limpieza", "supplier": "AutoClean Pro"},
        {"name": "Cera Protectora", "description": "Cera líquida para protección de pintura", "price": 35.00, "cost": 20.00, "stock": 30, "min_stock": 5, "category": "Protección", "supplier": "Car Shield"},
        {"name": "Limpiador de Interiores", "description": "Spray multipropósito para interiores", "price": 18.00, "cost": 10.00, "stock": 40, "min_stock": 8, "category": "Limpieza", "supplier": "Interior Care"},
        {"name": "Toallas de Microfibra", "description": "Pack de 5 toallas de alta absorción", "price": 45.00, "cost": 25.00, "stock": 25, "min_stock": 5, "category": "Accesorios", "supplier": "MicroFiber Plus"}
    ]
    
    for product_data in sample_products:
        db_product = database.Product(**product_data)
        db.add(db_product)
    
    # Servicios de ejemplo
    sample_services = [
        {"name": "Lavado Básico", "description": "Lavado exterior completo", "price": 80.00, "duration": 30, "category": "Lavado", "active": True},
        {"name": "Lavado Premium", "description": "Lavado exterior + interior + encerado", "price": 150.00, "duration": 60, "category": "Lavado", "active": True},
        {"name": "Lavado Detallado", "description": "Servicio completo con detallado", "price": 250.00, "duration": 120, "category": "Detallado", "active": True},
        {"name": "Solo Aspirado", "description": "Limpieza de interiores únicamente", "price": 40.00, "duration": 20, "category": "Interior", "active": True}
    ]
    
    for service_data in sample_services:
        db_service = database.Service(**service_data)
        db.add(db_service)
    
    db.commit()