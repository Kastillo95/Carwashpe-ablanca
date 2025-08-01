from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Esquemas para Products
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    cost: float
    stock: int = 0
    min_stock: int = 0
    category: Optional[str] = None
    supplier: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    stock: Optional[int] = None
    min_stock: Optional[int] = None
    category: Optional[str] = None
    supplier: Optional[str] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Esquemas para Services
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration: Optional[int] = None
    category: Optional[str] = None
    active: bool = True
    required_products: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[int] = None
    category: Optional[str] = None
    active: Optional[bool] = None
    required_products: Optional[str] = None

class Service(ServiceBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquemas para Customers
class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    vehicle_info: Optional[str] = None
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    vehicle_info: Optional[str] = None
    notes: Optional[str] = None

class Customer(CustomerBase):
    id: int
    created_at: datetime
    last_visit: Optional[datetime] = None
    total_spent: float = 0.0
    
    class Config:
        from_attributes = True

# Esquemas para Appointments
class AppointmentStatus(str, Enum):
    programada = "programada"
    en_proceso = "en_proceso"
    completada = "completada"
    cancelada = "cancelada"

class AppointmentBase(BaseModel):
    customer_id: int
    service_id: int
    date: datetime
    status: AppointmentStatus = AppointmentStatus.programada
    notes: Optional[str] = None
    estimated_duration: Optional[int] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    customer_id: Optional[int] = None
    service_id: Optional[int] = None
    date: Optional[datetime] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None

class Appointment(AppointmentBase):
    id: int
    created_at: datetime
    actual_duration: Optional[int] = None
    customer: Optional[Customer] = None
    service: Optional[Service] = None
    
    class Config:
        from_attributes = True

# Esquemas para Invoices
class InvoiceStatus(str, Enum):
    pendiente = "pendiente"
    pagada = "pagada"
    vencida = "vencida"

class InvoiceItemBase(BaseModel):
    type: str  # service, product
    item_id: int
    name: str
    quantity: int = 1
    unit_price: float

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    total_price: float
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    customer_id: int
    appointment_id: Optional[int] = None
    subtotal: float
    tax: float = 0.0
    total: float
    status: InvoiceStatus = InvoiceStatus.pendiente
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate] = []

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatus] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    date: datetime
    customer: Optional[Customer] = None
    appointment: Optional[Appointment] = None
    items: List[InvoiceItem] = []
    
    class Config:
        from_attributes = True

# Esquemas para Users
class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    active: Optional[bool] = None

class User(UserBase):
    id: int
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Esquemas para Dashboard
class DashboardStats(BaseModel):
    todayAppointments: int
    dailyRevenue: float
    totalCustomers: int
    lowStockProducts: int
    monthlyRevenue: float
    completedAppointments: int
    pendingAppointments: int
    totalProducts: int
    totalServices: int

# Esquemas para respuestas de API
class Message(BaseModel):
    message: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None