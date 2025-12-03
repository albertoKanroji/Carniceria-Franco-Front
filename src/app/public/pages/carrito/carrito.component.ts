import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarritoService, ItemCarrito } from 'src/services/carrito/carrito.service';
import { VentasService, CrearVentaRequest } from 'src/services/ventas/ventas.service';
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
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' = 'tarjeta';
  notasCompra: string = '';

  // Modales
  mostrarModalConfirmacion: boolean = false;
  mostrarModalEliminarSeleccionados: boolean = false;
  mostrarModalVaciarCarrito: boolean = false;
  mostrarModalEliminarProducto: boolean = false;
  productoAEliminar: number | null = null;

  // Loaders
  eliminandoProducto: boolean = false;
  vaciandoCarrito: boolean = false;

  constructor(
    private carritoService: CarritoService,
    private ventasService: VentasService,
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
    return this.itemsCarrito.reduce((total, item) => total + item.subtotal, 0);
  }

  get iva(): number {
    return this.subtotal * 0.16;
  }

  get total(): number {
    return this.subtotal + this.iva;
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
    if (imagen.startsWith('http')) {
      return imagen;
    }
    return `${environment.apiUrl.replace('/api/v1', '')}/${imagen}`;
  }

  actualizarCantidad(productoId: number, cantidad: number): void {
    if (cantidad > 0) {
      this.carritoService.actualizarCantidad(productoId, cantidad);
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
      this.cerrarModalConfirmacion();
      this.realizarCompra(customerId);
    }
  }

  realizarCompra(customerId: number): void {
    this.procesandoPago = true;

    const ventaRequest: CrearVentaRequest = {
      customer_id: customerId,
      metodo_pago: this.metodoPago,
      descuento: 0,
      notas: this.notasCompra || undefined,
      productos: this.itemsCarrito.map(item => ({
        product_id: item.producto.id,
        cantidad: item.cantidad
      }))
    };

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
}
