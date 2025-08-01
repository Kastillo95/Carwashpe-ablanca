from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Configuración de la base de datos
DATABASE_URL = "sqlite:///./carwash-python.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelos de base de datos
class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=0)
    category = Column(String)
    supplier = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    duration = Column(Integer)  # en minutos
    category = Column(String)
    active = Column(Boolean, default=True)
    required_products = Column(Text)  # JSON string de productos necesarios

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    address = Column(Text)
    vehicle_info = Column(Text)  # JSON string con info del vehículo
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_visit = Column(DateTime)
    total_spent = Column(Float, default=0.0)
    
    # Relaciones
    appointments = relationship("Appointment", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    date = Column(DateTime, nullable=False)
    status = Column(String, default="programada")  # programada, en_proceso, completada, cancelada
    notes = Column(Text)
    estimated_duration = Column(Integer)
    actual_duration = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    customer = relationship("Customer", back_populates="appointments")
    service = relationship("Service")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    invoice_number = Column(String, unique=True, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    status = Column(String, default="pendiente")  # pendiente, pagada, vencida
    payment_method = Column(String)
    notes = Column(Text)
    
    # Relaciones
    customer = relationship("Customer", back_populates="invoices")
    appointment = relationship("Appointment")
    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    type = Column(String, nullable=False)  # service, product
    item_id = Column(Integer, nullable=False)  # ID del servicio o producto
    name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Relaciones
    invoice = relationship("Invoice", back_populates="items")

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="user")  # admin, user
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Función para crear las tablas
def create_tables():
    Base.metadata.create_all(bind=engine)

# Función para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()