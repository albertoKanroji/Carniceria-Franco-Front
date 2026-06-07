import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SitioConfigService, SitioConfiguracion } from '../../../services/sitio-config/sitio-config.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  configuracion$!: Observable<SitioConfiguracion>;
  whatsappLink = '#';
  telefonoLink = '#';

  constructor(private sitioConfigService: SitioConfigService) { }

  ngOnInit(): void {
    this.configuracion$ = this.sitioConfigService.obtenerConfiguracion().pipe(
      map((config) => {
        const whatsapp = this.limpiarNumero(config.whatsapp || config.telefono);
        this.whatsappLink = `https://wa.me/52${whatsapp}?text=${encodeURIComponent('Hola, quiero hacer un pedido. ¿Me puedes ayudar?')}`;
        this.telefonoLink = `tel:+52${whatsapp}`;
        return config;
      })
    );
  }

  limpiarNumero(numero: string): string {
    return (numero || '').replace(/\D/g, '');
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
      horario: horarios?.[dia]?.trim() || 'Cerrado'
    }));
  }

}
