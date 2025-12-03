import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Interfaces
export interface VentaDetalle {
  id: number;
  sale_id: number;
  product_id: number;
  cantidad: number;
  precio_unitario: number;
  precio_oferta: number | null;
  descuento: number;
  subtotal: number;
  total: number;
  producto_nombre: string;
  producto_codigo: string;
  unidad_venta: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    nombre: string;
    codigo: string;
    precio: number;
    precio_oferta?: number;
    en_oferta?: number;
    imagen: string | null;
    activo: number;
    stock: number;
  };
}

export interface CustomerVenta {
  id: number;
  nombre: string;
  apellido: string;
  apellido2?: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal?: string;
  tipo_cliente: string;
  total_compras: number;
  numero_compras: number;
  fecha_ultima_compra?: string;
}

export interface Venta {
  id: number;
  customer_id: number;
  folio: string;
  fecha_venta: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  metodo_pago: string;
  estatus: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
  details?: VentaDetalle[];
  customer?: CustomerVenta;
}

export interface CrearVentaRequest {
  customer_id: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
  descuento?: number;
  notas?: string;
  productos: {
    product_id: number;
    cantidad: number;
  }[];
}

export interface VentasResponse {
  success: boolean;
  status: number;
  message: string;
  data: Venta;
}

export interface HistorialComprasResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    customer: CustomerVenta;
    purchases: {
      current_page: number;
      data: Venta[];
      first_page_url: string;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  };
}

export interface EstadisticasClienteResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    total_compras: number;
    numero_compras: number;
    fecha_ultima_compra: string | null;
    promedio_compra: number;
    compras_este_mes: number;
    total_este_mes: number;
    producto_mas_comprado: {
      producto: string;
      cantidad_total: number;
    } | null;
  };
}

export interface ComprasRecientesResponse {
  success: boolean;
  status: number;
  message: string;
  data: Venta[];
}

export interface TodasVentasResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    current_page: number;
    data: Venta[];
    first_page_url: string;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Crear una nueva venta con múltiples productos
   */
  crearVenta(venta: CrearVentaRequest): Observable<VentasResponse> {
    return this.http.post<VentasResponse>(`${this.apiUrl}/ventas`, venta);
  }

  /**
   * Obtener historial completo de compras de un cliente (paginado)
   */
  obtenerHistorialCliente(customerId: number, page: number = 1, perPage: number = 15): Observable<HistorialComprasResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<HistorialComprasResponse>(`${this.apiUrl}/ventas/cliente/${customerId}`, { params });
  }

  /**
   * Obtener estadísticas completas de compras del cliente
   */
  obtenerEstadisticasCliente(customerId: number): Observable<EstadisticasClienteResponse> {
    return this.http.get<EstadisticasClienteResponse>(`${this.apiUrl}/ventas/cliente/${customerId}/estadisticas`);
  }

  /**
   * Obtener las 5 compras más recientes del cliente
   */
  obtenerComprasRecientes(customerId: number): Observable<ComprasRecientesResponse> {
    return this.http.get<ComprasRecientesResponse>(`${this.apiUrl}/ventas/cliente/${customerId}/recientes`);
  }

  /**
   * Obtener detalle completo de una compra específica
   */
  obtenerDetalleVenta(saleId: number): Observable<VentasResponse> {
    return this.http.get<VentasResponse>(`${this.apiUrl}/ventas/${saleId}`);
  }

  /**
   * Cancelar una compra (devuelve stock y actualiza estadísticas)
   */
  cancelarVenta(saleId: number): Observable<VentasResponse> {
    return this.http.put<VentasResponse>(`${this.apiUrl}/ventas/${saleId}/cancelar`, {});
  }

  /**
   * Obtener todas las ventas con filtros (endpoint para administrador)
   */
  obtenerTodasVentas(
    filtros?: {
      estatus?: 'pendiente' | 'completada' | 'cancelada' | 'entregada';
      fecha_inicio?: string;
      fecha_fin?: string;
      metodo_pago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito';
      per_page?: number;
      page?: number;
    }
  ): Observable<TodasVentasResponse> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.estatus) params = params.set('estatus', filtros.estatus);
      if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
      if (filtros.metodo_pago) params = params.set('metodo_pago', filtros.metodo_pago);
      if (filtros.per_page) params = params.set('per_page', filtros.per_page.toString());
      if (filtros.page) params = params.set('page', filtros.page.toString());
    }

    return this.http.get<TodasVentasResponse>(`${this.apiUrl}/ventas`, { params });
  }
}
