import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SitioConfigService, SitioConfiguracion } from '../../../services/sitio-config/sitio-config.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  configuracion$!: Observable<SitioConfiguracion>;
  whatsappLink = '#';
  telefonoLink = '#';

  constructor(private sitioConfigService: SitioConfigService) { }

  ngOnInit(): void {
    this.configuracion$ = this.sitioConfigService.obtenerConfiguracion().pipe(
      map((config) => {
        const whatsapp = this.limpiarNumero(config.whatsapp || config.telefono);
        this.whatsappLink = `https://wa.me/52${whatsapp}?text=${encodeURIComponent('Hola, quiero hacer un pedido o pedir información.')}`;
        this.telefonoLink = `tel:+52${whatsapp}`;
        return config;
      })
    );
  }

  limpiarNumero(numero: string): string {
    return (numero || '').replace(/\D/g, '');
  }

  formatearHorario(valor: string | undefined): string {
    return valor?.trim() || 'Cerrado';
  }

  obtenerDiasOrdenados(horarios: Record<string, string | undefined>): Array<{ dia: string; horario: string }> {
    const orden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const etiquetas: Record<string, string> = {
      lunes: 'Lunes',
      martes: 'Martes',
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo',
    };

    return orden.map((dia) => ({
      dia: etiquetas[dia],
      horario: this.formatearHorario(horarios?.[dia])
    }));
  }

}
