import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth-service/auth-service.service';
import { NotificacionService } from 'src/services/notificacion-service/notificaciones.service';
import { CarritoService, ItemCarrito } from 'src/services/carrito/carrito.service';
import { environment } from 'src/environments/environment';
declare var bootstrap: any;
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  modalNotificacion: any;
  selectedTheme: string | undefined;
  loading: boolean = false;
  notificaciones: any[] = [];
  isLoggedIn = false;
  buttonText!: string;
  userImage: string | null = null;
  userName: string | null = null;
  profileStatusIcon: string | null = null;
  notificacionesOriginales: any[] = [];
  itemsCarrito: ItemCarrito[] = [];
  cantidadCarrito: number = 0;

  mostrarModal(notificacion: any): void {
    const vistas = JSON.parse(
      localStorage.getItem('notificaciones_vistas') || '[]'
    );

    if (!vistas.includes(notificacion.id)) {
      vistas.push(notificacion.id);
      localStorage.setItem('notificaciones_vistas', JSON.stringify(vistas));
    }

    this.modalNotificacion = notificacion;
    const modal = new bootstrap.Modal(
      document.getElementById('notificacionModal')!
    );
    modal.show();
    this.notificacionesOriginales = this.notificacionesOriginales.filter(
      (n) => n.id !== notificacion.id
    );
  }
  filtrarNotificacionesNoVistas(): void {
    const vistas = JSON.parse(
      localStorage.getItem('notificaciones_vistas') || '[]'
    );
    this.notificaciones = this.notificacionesOriginales.filter(
      (n) => !vistas.includes(n.id)
    );
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificacionService: NotificacionService,
    private carritoService: CarritoService
  ) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      if (this.isLoggedIn) {
        this.updateUserData();
      } else {
        this.userImage = null;
        this.userName = null;
        this.profileStatusIcon = null;
      }
    });

    // Suscribirse a los cambios en el estado del perfil
    this.authService.profileStatus$.subscribe(() => {
      this.updateProfileStatusIcon();
    });

    // Suscribirse a los cambios del carrito
    this.carritoService.obtenerCarritoObservable().subscribe(items => {
      this.itemsCarrito = items;
      this.cantidadCarrito = items.reduce((total, item) => total + item.cantidad, 0);
    });
  }
  private updateUserData() {
    const userData = this.authService.getUserData();
    this.userName = `${userData.nombre}`;
    this.userImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      this.userName
    )}`;
    this.updateProfileStatusIcon();
  }

  private updateProfileStatusIcon(): void {
    const profileIsComplete = localStorage.getItem('profileIsComplete') || 'no';
    this.profileStatusIcon =
      profileIsComplete === 'si'
        ? 'fa-check-circle' // Icono de check
        : 'fa-exclamation-circle'; // Icono de admiración
  }
  ngOnInit() {
    // Obtener el tema seleccionado del localStorage al cargar la aplicación
    this.selectedTheme = localStorage.getItem('selectedTheme') || 'light'; // Establecer el tema predeterminado como 'light' si no hay ningún tema seleccionado
    this.updateButtonText(this.selectedTheme); // Actualizar el texto del botón al cargar la aplicación
    this.applyTheme(this.selectedTheme); // Aplicar el tema al cargar la aplicación
    this.obtenerNotificaciones(); // Obtener las rutinas al cargar la aplicación
  }
  obtenerNotificaciones(): void {
    this.loading = true;

    const vistas = JSON.parse(localStorage.getItem('notificaciones_vistas') || '[]');

    this.notificacionService.obtenerNotificaciones().subscribe(
      (data: any) => {
        // Filtra las no vistas
        this.notificacionesOriginales = data.data.filter(
          (n: any) => !vistas.includes(n.id)
        );
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener las rutinas:', error);
        this.loading = false;
      }
    );
  }

  formatFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return fechaObj.toLocaleDateString('es-ES', opciones);
  }

  changeTheme(theme: string) {
    this.selectedTheme = theme; // Actualizar el tema seleccionado
    localStorage.setItem('selectedTheme', theme); // Guardar el tema seleccionado en localStorage
    this.updateButtonText(theme); // Actualizar el texto del botón al cambiar de tema
    this.applyTheme(theme); // Aplicar el nuevo tema
  }

  private updateButtonText(theme: string) {
    this.buttonText = theme === 'light' ? 'Cambiar a Dark' : 'Cambiar a Light'; // Definir el texto del botón según el tema actual
  }

  private applyTheme(theme: string) {
    const body = document.body as HTMLElement;
    body.setAttribute('data-bs-theme', theme); // Aplicar el tema
  }
  closeDropdowns() {
    // Cerrar todos los dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-menu.show');
    dropdowns.forEach((dropdown: any) => {
      dropdown.classList.remove('show');
    });
  }

  logout(): void {
    // Llamar al método logout() del servicio AuthService
    this.authService.logout();
  }

  getImagenProducto(imagen: string | null): string {
    if (!imagen) {
      return 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=100';
    }
    if (imagen.startsWith('http')) {
      return imagen;
    }
    return `${environment.apiUrl.replace('/api/v1', '')}/${imagen}`;
  }

  verCarritoCompleto(): void {
    this.router.navigate(['/pages/carrito']);
  }

  eliminarDelCarrito(productoId: number): void {
    this.carritoService.eliminarProducto(productoId);
  }
}
