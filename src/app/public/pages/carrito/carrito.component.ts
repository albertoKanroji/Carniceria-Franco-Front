import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito } from 'src/services/carrito/carrito.service';
import { VentasService, CrearVentaRequest } from 'src/services/ventas/ventas.service';
import { MercadoPagoService, PreferenceData } from 'src/services/mercadopago/mercadopago.service';
import { AuthService } from 'src/services/auth-service/auth-service.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {

  itemsCarrito: ItemCarrito[] = [];
  itemsSeleccionados: Set<number> = new Set();
  todoSeleccionado: boolean = false;
  procesandoPago: boolean = false;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'mercado_pago' = 'tarjeta';
  notasCompra: string = '';

  // Modales
  mostrarModalConfirmacion: boolean = false;
  mostrarModalEliminarSeleccionados: boolean = false;
  mostrarModalVaciarCarrito: boolean = false;
  mostrarModalEliminarProducto: boolean = false;
  mostrarModalMercadoPago: boolean = false;
  productoAEliminar: number | null = null;

  // Loaders
  eliminandoProducto: boolean = false;
  vaciandoCarrito: boolean = false;

  constructor(
    private carritoService: CarritoService,
    private ventasService: VentasService,
    private mercadoPagoService: MercadoPagoService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cargarCarrito();
  }

  cargarCarrito(): void {
    this.carritoService.obtenerCarritoObservable().subscribe(items => {
      this.itemsCarrito = items;
      this.verificarTodoSeleccionado();
    });
  }

  get subtotal(): number {
    return this.itemsCarrito.reduce((total, item) => total + Number(item.subtotal || 0), 0);
  }

  get iva(): number {
    return Number(this.subtotal) * 0.16;
  }

  get total(): number {
    return Number(this.subtotal) + Number(this.iva);
  }

  get totalSeleccionados(): number {
    return this.itemsCarrito
      .filter(item => this.itemsSeleccionados.has(item.producto.id))
      .reduce((total, item) => total + item.subtotal, 0);
  }

  getImagenProducto(imagen: string | null): string {
    if (!imagen) {
      return 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400';
    }

    // Si ya es una URL completa, limpiar las barras invertidas
    if (imagen.startsWith('http')) {
      return imagen.replace(/\\/g, '');
    }

    // Si empieza con '/', construir la URL completa
    if (imagen.startsWith('/')) {
      return `${environment.apiUrl.replace('/api/v1', '')}${imagen.replace(/\\/g, '')}`;
    }

    return `${environment.apiUrl.replace('/api/v1', '')}/${imagen}`;
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    const cantidadNum = Number(cantidad);
    if (cantidadNum > 0) {
      this.carritoService.actualizarCantidad(productoId, cantidadNum);
    }
  }

  incrementarCantidad(productoId: number): void {
    const item = this.itemsCarrito.find(i => i.producto.id === productoId);
    if (item) {
      this.actualizarCantidad(productoId, item.cantidad + 1);
    }
  }

  decrementarCantidad(productoId: number): void {
    const item = this.itemsCarrito.find(i => i.producto.id === productoId);
    if (item && item.cantidad > 1) {
      this.actualizarCantidad(productoId, item.cantidad - 1);
    }
  }

  eliminarProducto(productoId: number): void {
    this.productoAEliminar = productoId;
    this.mostrarModalEliminarProducto = true;
  }

  confirmarEliminarProducto(): void {
    if (this.productoAEliminar !== null) {
      this.eliminandoProducto = true;
      setTimeout(() => {
        this.carritoService.eliminarProducto(this.productoAEliminar!);
        this.itemsSeleccionados.delete(this.productoAEliminar!);
        this.eliminandoProducto = false;
        this.cerrarModalEliminarProducto();
        this.toastr.success('Producto eliminado del carrito', 'Eliminado');
      }, 300);
    }
  }

  cerrarModalEliminarProducto(): void {
    this.mostrarModalEliminarProducto = false;
    this.productoAEliminar = null;
  }

  toggleSeleccion(productoId: number): void {
    if (this.itemsSeleccionados.has(productoId)) {
      this.itemsSeleccionados.delete(productoId);
    } else {
      this.itemsSeleccionados.add(productoId);
    }
    this.verificarTodoSeleccionado();
  }

  toggleTodoSeleccionado(): void {
    if (this.todoSeleccionado) {
      this.itemsSeleccionados.clear();
    } else {
      this.itemsCarrito.forEach(item => {
        this.itemsSeleccionados.add(item.producto.id);
      });
    }
    this.todoSeleccionado = !this.todoSeleccionado;
  }

  verificarTodoSeleccionado(): void {
    this.todoSeleccionado = this.itemsCarrito.length > 0 &&
                           this.itemsCarrito.every(item => this.itemsSeleccionados.has(item.producto.id));
  }

  eliminarSeleccionados(): void {
    if (this.itemsSeleccionados.size === 0) {
      this.toastr.warning('Selecciona al menos un producto para eliminar', 'Advertencia');
      return;
    }
    this.mostrarModalEliminarSeleccionados = true;
  }

  confirmarEliminarSeleccionados(): void {
    this.eliminandoProducto = true;
    setTimeout(() => {
      this.carritoService.eliminarSeleccionados(Array.from(this.itemsSeleccionados));
      const cantidad = this.itemsSeleccionados.size;
      this.itemsSeleccionados.clear();
      this.todoSeleccionado = false;
      this.eliminandoProducto = false;
      this.cerrarModalEliminarSeleccionados();
      this.toastr.success(`${cantidad} producto(s) eliminado(s)`, 'Eliminados');
    }, 300);
  }

  cerrarModalEliminarSeleccionados(): void {
    this.mostrarModalEliminarSeleccionados = false;
  }

  vaciarCarrito(): void {
    this.mostrarModalVaciarCarrito = true;
  }

  confirmarVaciarCarrito(): void {
    this.vaciandoCarrito = true;
    setTimeout(() => {
      this.carritoService.vaciarCarrito();
      this.itemsSeleccionados.clear();
      this.todoSeleccionado = false;
      this.vaciandoCarrito = false;
      this.cerrarModalVaciarCarrito();
      this.toastr.success('Carrito vaciado correctamente', 'Vaciado');
    }, 300);
  }

  cerrarModalVaciarCarrito(): void {
    this.mostrarModalVaciarCarrito = false;
  }

  continuarComprando(): void {
    this.router.navigate(['/pages/productos']);
  }

  procederPago(): void {
    if (this.itemsCarrito.length === 0) {
      this.toastr.warning('Tu carrito está vacío', 'Carrito Vacío');
      return;
    }

    const customerId = this.authService.getUserId();
    if (!customerId) {
      this.toastr.error('Debes iniciar sesión para realizar una compra', 'No Autorizado');
      this.router.navigate(['/login']);
      return;
    }

    this.mostrarModalConfirmacion = true;
  }

  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
  }

  confirmarCompra(): void {
    const customerId = this.authService.getUserId();
    if (customerId) {
      console.log('=== DEBUG: Confirmando compra ===');
      console.log('Items en carrito:', this.itemsCarrito);
      console.log('Método de pago:', this.metodoPago);
      console.log('Total:', this.total);

      this.cerrarModalConfirmacion();

      if (this.metodoPago === 'mercado_pago') {
        this.procesarPagoMercadoPago(customerId);
      } else {
        this.realizarCompraTradicional(customerId);
      }
    }
  }

  // Nuevo método para procesar pago con Mercado Pago
  procesarPagoMercadoPago(customerId: number): void {
    // Validar datos antes del envío
    if (!this.validarDatosCarrito()) {
      return;
    }

    this.procesandoPago = true;

    const preferenceData: PreferenceData = {
      customer_id: customerId,
      productos: this.itemsCarrito.map(item => {
        const producto: any = {
          product_id: Number(item.producto.id),
          cantidad: Number(item.cantidad)
        };

        // Solo agregar monto_pesos si el tipo de venta es por pesos
        if (item.tipoVenta === 'pesos' && item.monto_pesos) {
          producto.monto_pesos = Number(item.monto_pesos);
        }

        return producto;
      }),
      metodo_pago: 'mercado_pago',
      descuento: 0,
      notas: this.notasCompra || undefined
    };

    console.log('Enviando datos a Mercado Pago:', preferenceData); // Debug log

    this.mercadoPagoService.createPreference(preferenceData).subscribe({
      next: (response) => {
        if (response.success) {
          // Guardar referencia de la venta pendiente en localStorage
          localStorage.setItem('venta_pendiente_mp', JSON.stringify({
            venta_id: response.data.venta_pendiente_id,
            preference_id: response.data.preference_id,
            timestamp: Date.now()
          }));

          // Redirigir al checkout de Mercado Pago
          window.location.href = response.data.init_point;
        } else {
          this.procesandoPago = false;
          this.toastr.error(response.message, 'Error');
        }
      },
      error: (error) => {
        console.error('Error al crear preferencia de Mercado Pago:', error);
        this.procesandoPago = false;
        this.toastr.error('No se pudo conectar con Mercado Pago', 'Error');
      }
    });
  }

  realizarCompraTradicional(customerId: number): void {
    // Validar datos antes del envío
    if (!this.validarDatosCarrito()) {
      return;
    }

    this.procesandoPago = true;

    const ventaRequest: CrearVentaRequest = {
      customer_id: customerId,
      metodo_pago: this.metodoPago as 'efectivo' | 'tarjeta' | 'transferencia' | 'credito',
      descuento: 0,
      notas: this.notasCompra || undefined,
      productos: this.itemsCarrito.map(item => {
        const producto: any = {
          product_id: Number(item.producto.id),
          cantidad: Number(item.cantidad)
        };

        // Solo agregar monto_pesos si el tipo de venta es por pesos
        if (item.tipoVenta === 'pesos' && item.monto_pesos) {
          producto.monto_pesos = Number(item.monto_pesos);
        }

        return producto;
      })
    };

    console.log('Enviando datos de venta tradicional:', ventaRequest); // Debug log

    this.ventasService.crearVenta(ventaRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.carritoService.vaciarCarrito();
          this.toastr.success(
            `Folio: ${response.data.folio}`,
            '¡Compra Exitosa!',
            { timeOut: 3000 }
          );
          this.procesandoPago = false;

          // Redirigir al perfil tab compras
          setTimeout(() => {
            this.router.navigate(['/pages/profile'], {
              queryParams: { tab: 'compras' }
            });
          }, 1500);
        }
      },
      error: (error) => {
        console.error('Error al procesar la compra:', error);
        this.procesandoPago = false;

        let errorMessage = 'No se pudo completar la compra. Intenta nuevamente.';

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 422 && error.error?.data) {
          // Errores de validación
          const validationErrors = Object.values(error.error.data).flat();
          errorMessage = validationErrors.join('\n');
        }

        this.toastr.error(errorMessage, 'Error en la Compra', { timeOut: 5000 });
      }
    });
  }

  // Métodos para manejo de tipo de venta
  cambiarTipoVenta(productoId: number, tipo: 'cantidad' | 'pesos'): void {
    const item = this.itemsCarrito.find(i => i.producto.id === productoId);
    if (item) {
      const precioBase = Number(item.producto.precio_final || item.producto.precio_oferta || item.producto.precio || 0);

      if (tipo === 'cantidad') {
        // Cambiar a venta por cantidad
        const cantidad = Number(item.cantidad) || 1;
        this.carritoService.actualizarCantidad(productoId, cantidad);
      } else {
        // Cambiar a venta por pesos
        const montoBase = item.monto_pesos ? Number(item.monto_pesos) : (precioBase * Number(item.cantidad || 1));
        this.carritoService.actualizarMontoPesos(productoId, montoBase);
      }
    }
  }

  // Método para validar datos antes del envío
  private validarDatosCarrito(): boolean {
    for (let item of this.itemsCarrito) {
      // Verificar que todos los items tengan cantidad válida
      if (!item.cantidad || item.cantidad <= 0) {
        this.toastr.error(`El producto "${item.producto.nombre}" no tiene una cantidad válida`, 'Error de validación');
        return false;
      }

      // Si es venta por pesos, verificar que tenga monto válido
      if (item.tipoVenta === 'pesos' && (!item.monto_pesos || item.monto_pesos <= 0)) {
        this.toastr.error(`El producto "${item.producto.nombre}" no tiene un monto de pesos válido`, 'Error de validación');
        return false;
      }

      // Verificar que el subtotal sea válido
      if (!item.subtotal || item.subtotal <= 0) {
        this.toastr.error(`El producto "${item.producto.nombre}" no tiene un subtotal válido`, 'Error de validación');
        return false;
      }
    }
    return true;
  }

  actualizarMontoPesos(productoId: number, monto: number): void {
    const montoNum = Number(monto);
    if (montoNum > 0) {
      this.carritoService.actualizarMontoPesos(productoId, montoNum);
    }
  }

  // Verificar si el producto puede venderse por pesos
  puedeVendersePorPesos(unidadVenta: string): boolean {
    const unidad = unidadVenta.toLowerCase();
    return unidad.includes('kilogramo') || unidad.includes('gramo') || unidad.includes('kg') || unidad.includes('g');
  }

  // Obtener el texto del método de pago
  getTextoMetodoPago(): string {
    switch(this.metodoPago) {
      case 'efectivo': return '💵 Efectivo';
      case 'tarjeta': return '💳 Tarjeta';
      case 'transferencia': return '🏦 Transferencia';
      case 'credito': return '📄 Crédito';
      case 'mercado_pago': return '🛒 Mercado Pago';
      default: return 'Método de pago';
    }
  }

  realizarCompra(customerId: number): void {
    // Método mantenido por compatibilidad, ahora redirige a los nuevos métodos
    if (this.metodoPago === 'mercado_pago') {
      this.procesarPagoMercadoPago(customerId);
    } else {
      this.realizarCompraTradicional(customerId);
    }
  }
}
