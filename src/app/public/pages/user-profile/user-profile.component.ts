import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {LoginService} from "../../../../services/login/login.service";
import {AuthService} from "../../../../services/auth-service/auth-service.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CustomerService} from "../../../../services/customers/customer-service.service";
import { VentasService, Venta, EstadisticasClienteResponse, CarritoRecomendado, ProductoRecomendado, RecomendacionesResponse } from 'src/services/ventas/ventas.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import {catchError, of} from "rxjs";
import { CarritoService } from 'src/services/carrito/carrito.service';
import { Producto } from 'src/services/productos/productos.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  myForm!: FormGroup;
  loading = false;
  loadingBTN = false;
  loadingCompras = false;
  loadingRecomendaciones = false;
  activeTab: string = 'datos';
  // Declara una variable para almacenar la respuesta del servicio
  solicitud: any;
  compras: Venta[] = [];
  comprasRecientes: Venta[] = [];
  estadisticas: any = null;
  // Paginación
  paginaActual = 1;
  totalPaginas = 1;
  totalCompras = 0;
  comprasPorPagina = 10;
  // Detalle de compra seleccionada
  compraSeleccionada: Venta | null = null;
  mostrandoDetalle = false;
  // Recomendaciones
  recomendaciones: CarritoRecomendado[] = [];
  datosRecomendaciones: any = null;

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'compras' && this.compras.length === 0) {
      this.loadCompras();
      this.loadEstadisticas();
    }
    if (tab === 'recomendaciones' && this.recomendaciones.length === 0) {
      this.loadRecomendaciones();
    }
  }

  loadCompras() {
    const customerId = this.authService.getUserId();
    if (!customerId) {
      this.toastr.error('No se pudo obtener el ID del cliente');
      return;
    }

    this.loadingCompras = true;
    this.ventasService.obtenerHistorialCliente(customerId, this.paginaActual, this.comprasPorPagina)
      .pipe(
        catchError(err => {
          console.error('Error al cargar compras:', err);
          this.toastr.error('No se pudieron cargar las compras', 'Error');
          this.loadingCompras = false;
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.success) {
          this.compras = response.data.purchases.data;
          this.paginaActual = response.data.purchases.current_page;
          this.totalPaginas = response.data.purchases.last_page;
          this.totalCompras = response.data.purchases.total;
          this.loadingCompras = false;
        }
      });
  }

  loadEstadisticas() {
    const customerId = this.authService.getUserId();
    if (!customerId) return;

    this.ventasService.obtenerEstadisticasCliente(customerId)
      .pipe(
        catchError(err => {
          console.error('Error al cargar estadísticas:', err);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.success) {
          this.estadisticas = response.data;
        }
      });
  }

  verDetalleCompra(compraId: number) {
    this.ventasService.obtenerDetalleVenta(compraId)
      .pipe(
        catchError(err => {
          console.error('Error al cargar detalle:', err);
          this.toastr.error('No se pudo cargar el detalle de la compra', 'Error');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.success) {
          this.compraSeleccionada = response.data;
          this.mostrandoDetalle = true;
        }
      });
  }

  cerrarDetalle() {
    this.mostrandoDetalle = false;
    this.compraSeleccionada = null;
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas && pagina !== this.paginaActual) {
      this.paginaActual = pagina;
      this.loadCompras();
    }
  }

  getImagenProducto(imagen: string | null | undefined): string {
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

  getEstatusClass(estatus: string): string {
    switch(estatus) {
      case 'completada': return 'status-completada';
      case 'pendiente': return 'status-pendiente';
      case 'cancelada': return 'status-cancelada';
      case 'entregada': return 'status-entregada';
      default: return 'status-default';
    }
  }

  getMetodoPagoIcon(metodo: string): string {
    switch(metodo) {
      case 'tarjeta': return 'fa-credit-card';
      case 'efectivo': return 'fa-money-bill';
      case 'transferencia': return 'fa-exchange-alt';
      case 'credito': return 'fa-file-invoice-dollar';
      default: return 'fa-dollar-sign';
    }
  }

  // Helper para convertir string a número
  toNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  }

  // Helper para formatear valores monetarios
  formatMoney(value: any): string {
    return this.toNumber(value).toFixed(2);
  }

  // Métodos para Recomendaciones
  loadRecomendaciones() {
    const customerId = this.authService.getUserId();
    if (!customerId) {
      this.toastr.error('No se pudo obtener el ID del cliente');
      return;
    }

    this.loadingRecomendaciones = true;
    this.ventasService.obtenerRecomendaciones(customerId)
      .pipe(
        catchError(err => {
          console.error('Error al cargar recomendaciones:', err);
          this.toastr.error('No se pudieron cargar las recomendaciones', 'Error');
          this.loadingRecomendaciones = false;
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.success) {
          this.recomendaciones = response.data.recomendaciones;
          this.datosRecomendaciones = response.data;
        } else {
          this.recomendaciones = [];
        }
        this.loadingRecomendaciones = false;
      });
  }

  // TrackBy function para optimizar el rendering de carritos
  trackByCarrito(index: number, carrito: CarritoRecomendado): number {
    return carrito.id;
  }

  // Obtener la clase CSS del ícono del carrito según su ID
  getCarritoIconClass(carritoId: number): string {
    switch(carritoId) {
      case 1: return 'favoritos';
      case 2: return 'mix';
      case 3: return 'ofertas';
      default: return 'favoritos';
    }
  }

  // Obtener el ícono del carrito según su nombre
  getCarritoIcon(carritoNombre: string): string {
    if (carritoNombre.includes('Favoritos')) return 'fas fa-heart';
    if (carritoNombre.includes('Mix') || carritoNombre.includes('Recomendado')) return 'fas fa-magic';
    if (carritoNombre.includes('Ofertas')) return 'fas fa-tags';
    return 'fas fa-shopping-cart';
  }

  // Agregar un producto individual al carrito
  agregarProductoAlCarrito(producto: ProductoRecomendado) {
    // Convertir ProductoRecomendado a Producto para el servicio de carrito
    const productoParaCarrito: Producto = {
      id: producto.id,
      codigo: producto.codigo || '',
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: Number(producto.precio || 0),
      precio_oferta: producto.precio_oferta ? Number(producto.precio_oferta) : null,
      precio_final: producto.precio_oferta ? Number(producto.precio_oferta) : Number(producto.precio || 0),
      stock: producto.stock || 100,
      stock_minimo: 0,
      unidad_venta: producto.unidad_venta || 'unidad',
      category_id: producto.categoria_id || 0,
      imagen: producto.imagen || null,
      imagen_url: null,
      en_oferta: Number(producto.en_oferta) || 0,
      activo: 1,
      destacado: 0,
      refrigerado: 0,
      fecha_vencimiento: null,
      tiene_stock: true,
      created_at: '',
      updated_at: ''
    };

    // Agregar al carrito con la cantidad recomendada
    const cantidadAgregar = Number(producto.cantidad_recomendada || 1);
    this.carritoService.agregarProducto(productoParaCarrito, cantidadAgregar);

    this.toastr.success(
      `${cantidadAgregar} ${producto.unidad_venta}(s) agregado(s)`,
      `${producto.nombre}`
    );
  }

  // Agregar todo el carrito recomendado
  agregarCarritoCompleto(carrito: CarritoRecomendado) {
    if (!carrito.productos || carrito.productos.length === 0) {
      this.toastr.warning('No hay productos para agregar', 'Carrito vacío');
      return;
    }

    let productosAgregados = 0;

    // Agregar cada producto del carrito recomendado
    carrito.productos.forEach(producto => {
      const productoParaCarrito: Producto = {
        id: producto.id,
        codigo: producto.codigo || '',
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: Number(producto.precio || 0),
        precio_oferta: producto.precio_oferta ? Number(producto.precio_oferta) : null,
        precio_final: producto.precio_oferta ? Number(producto.precio_oferta) : Number(producto.precio || 0),
        stock: producto.stock || 100,
        stock_minimo: 0,
        unidad_venta: producto.unidad_venta || 'unidad',
        category_id: producto.categoria_id || 0,
        imagen: producto.imagen || null,
        imagen_url: null,
        en_oferta: Number(producto.en_oferta) || 0,
        activo: 1,
        destacado: 0,
        refrigerado: 0,
        fecha_vencimiento: null,
        tiene_stock: true,
        created_at: '',
        updated_at: ''
      };

      const cantidadAgregar = Number(producto.cantidad_recomendada || 1);
      this.carritoService.agregarProducto(productoParaCarrito, cantidadAgregar);
      productosAgregados++;
    });

    this.toastr.success(
      `${productosAgregados} producto(s) agregado(s) al carrito`,
      carrito.nombre,
      { timeOut: 3000 }
    );
  }

  // Contar productos favoritos (productos que aparecen en las recomendaciones)
  contarProductosFavoritos(): number {
    if (!this.recomendaciones || this.recomendaciones.length === 0) return 0;
    const productosUnicos = new Set();
    this.recomendaciones.forEach(carrito => {
      carrito.productos.forEach(producto => {
        productosUnicos.add(producto.id);
      });
    });
    return productosUnicos.size;
  }

  // Contar categorías diferentes en las recomendaciones
  contarCategorias(): number {
    if (!this.recomendaciones || this.recomendaciones.length === 0) return 0;
    const categoriasUnicas = new Set();
    this.recomendaciones.forEach(carrito => {
      carrito.productos.forEach(producto => {
        if (producto.categoria_id) {
          categoriasUnicas.add(producto.categoria_id);
        }
      });
    });
    return categoriasUnicas.size;
  }

  // Calcular ahorro total de todas las recomendaciones
  calcularAhorroTotal(): number {
    if (!this.recomendaciones || this.recomendaciones.length === 0) return 0;
    return this.recomendaciones.reduce((total, carrito) => {
      return total + this.toNumber(carrito.ahorro_estimado);
    }, 0);
  }

  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private authService:AuthService,
    private customerService: CustomerService,
    private ventasService: VentasService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private carritoService: CarritoService
  ) {
    this.myForm  = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      apellido2: [''],
      correo: [{ value: '', disabled: true }],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      estado: ['', Validators.required],
      codigo_postal: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      pais: ['México'],
      rfc: [''],
      tipo_cliente: [{ value: 'minorista', disabled: true }],
      saldo_cuenta: [{ value: '0.00', disabled: true }],
      total_compras: [{ value: '0.00', disabled: true }],
      numero_compras: [{ value: 0, disabled: true }]
    });
  }
getData(){
  this.loading=true;
  const clienteId = this.authService.getUserId(); // Obtén el ID del cliente desde AuthService
  if (clienteId) {
    this.loginService.getCustomerData(clienteId).subscribe(
      data => {
        // Rellenar el formulario con los datos del cliente
        this.myForm.patchValue(data.data);
        console.log(this.myForm)
        this.loading=false;
      },
      error => {
        this.loading=false;
        console.error(error); // Maneja cualquier error de la solicitud
      }
    );
  } else {
    console.error('No se pudo obtener el ID del cliente.');
  }
}
  ngOnInit(): void {
    this.getData();

    // Verificar si hay parámetro de tab en la URL
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'compras') {
        this.switchTab('compras');
      } else if (params['tab'] === 'recomendaciones') {
        this.switchTab('recomendaciones');
      }
    });
  }

  submitForm() {
    try {
      this.loadingBTN=true;
      const id = this.authService.getUserId();
      if (this.myForm.valid && id) {
        const formValue = this.myForm.value;
        this.customerService.updateCustomer(id, formValue)
          .pipe(
            catchError(err => {
              this.loadingBTN=false
              console.error('Error al actualizar el cliente:', err);
              this.showError();
              return of(null); // Retorna un observable vacío para continuar con la ejecución
            })
          )
          .subscribe(response => {

            if (response) {
              console.log('Cliente actualizado:', response);
              this.showSuccess();
              this.loadingBTN=false;
              this.getData();
              this.authService.updateProfileStatus('si');
            }
          });
      }
    } catch (error) {
      console.error('Error en el formulario:', error);
      this.showError();
      this.loadingBTN=false
    }
  }
  showSuccess() {
    this.toastr.info('Completado', 'Datos Actualizados');
  }
  showError() {
    this.toastr.error('No Completado', 'Ocurrio un error');
  }
}
