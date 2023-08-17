import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ClientsService, CompanySettingsService, ViaCepService} from "@app/_services";
import {Router} from "@angular/router";
import {map} from "rxjs/operators";
import {Clients, Company} from "@app/_models";

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.less']
})


export class ConfigurationComponent implements OnInit {

  empresa: string = '';
  segmento: string = '';
  moduloMesas: boolean = false;
  razao_social: string = '';
  nome_fantasia: string = '';
  cnpj: string = '';
  endereco: string = '';
  bairro: string = '';
  cep: string = '';
  // Variavel de checagem pessoa Fisica
  formCad: FormGroup;
  // Mascaras do formulario
  public cpfMask = [/[0-9]/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  public phoneMask = ['(', /[1-9]/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  public zipCodeMask = [/[0-9]/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/];
  public cnpjMask = /[0-9]\d.\d\d\d.\d\d\d\/\d\d\d\d-\d\d/;
  // Paterns
  phonePattern = /^\(\d{2}\) \d{5}-\d{4}$/;
  zipCodePattern = /^\d{5}\\-\d{3}$/;
  company?: Company[];
  companyInfo?: Company;
  receivedModuloMesas: boolean = false;
  isToggling = false;
  EditMode = true;

  constructor(private fb: FormBuilder,
              private viaCepService: ViaCepService,
              private CompanySettingsService: CompanySettingsService) {

    const currentDateTimestamp = Math.floor(Date.now() / 1000);

    this.formCad = this.fb.group({
        razao_social: [''],
        nome_fantasia: ['', [Validators.minLength(1)]],
        cnpj: ['', [Validators.pattern(this.cnpjMask)]],
        state_registration: [''],
        municipal_registration: [''],
        telephone: ['', [Validators.pattern(this.phonePattern)]],
        city: [''],
        street: [''],
        district: [''],
        state: [''],
        number: [''],
        complement: [''],
        country: [''],
        cep: ['', [Validators.pattern(this.zipCodePattern)]],
        created_at: currentDateTimestamp,
        codigo_regime_tributario: [''],
        pix_key: [''],
        moduloMesas: null
    });
  }

    mapCompanyInfoToForm() {
        this.receivedModuloMesas = this.companyInfo?.moduloMesas || false;
        this.formCad.patchValue({
            razao_social: this.companyInfo?.razao_social || '',
            nome_fantasia: this.companyInfo?.nome_fantasia || '',
            cnpj: this.companyInfo?.cnpj || '',
            state_registration: this.companyInfo?.state_registration || '',
            municipal_registration: this.companyInfo?.municipal_registration || '',
            telephone: this.companyInfo?.telephone || '',
            city: this.companyInfo?.city || '',
            street: this.companyInfo?.street || '',
            district: this.companyInfo?.district || '',
            state: this.companyInfo?.state || '',
            number: this.companyInfo?.number || '',
            complement: this.companyInfo?.complement || '',
            country: this.companyInfo?.country || '',
            cep: this.companyInfo?.cep || '',
            created_at: this.companyInfo?.created_at || '',
            codigo_regime_tributario: this.companyInfo?.codigo_regime_tributario || '' ,
            pix_key: this.companyInfo?.pix_key || '',
            moduloMesas: this.companyInfo?.moduloMesas
        });
    }

    ngOnInit(): void {
        this.getInfos();
        this.formCad.get('codigo_regime_tributario')?.disable();
    }


    searchZipCode(cep: string) {
    cep = cep.replace(/\D/g, '');
    if (cep !== '') {
      const cepValidate = /^[0-9]{8}$/;
      if (cepValidate.test(cep)) {
        this.viaCepService.getAddress(cep).subscribe(
            res => {
              console.log(res); // adiciona essa linha para imprimir a resposta no console
              if (!(res.hasOwnProperty('erro'))) {
                this.populateAddress(res);
                this.formCad.controls['cep'].setErrors(null);
              } else {
                this.formCad.controls['cep'].setErrors({ 'incorrect': true });
              }
            },
            error => {
              console.log(`Error: ${error}`);
            }
        );
      }
    }
  }

  populateAddress(res: any) {
    this.formCad.controls['street'].setValue(res.logradouro);
    this.formCad.controls['district'].setValue(res.bairro);
    this.formCad.controls['city'].setValue(res.localidade);
    this.formCad.controls['state'].setValue(res.uf);
  }

  public getCnpjMask(): (string | RegExp)[] {
    return [/[0-9]/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  }

  touchedVerify(field:any) {
    return !this.formCad.get(field)?.valid && this.formCad.get(field)?.touched;
  }

    toggleModuloMesas() {
        const moduloMesasControl = this.formCad.get('moduloMesas');
        if (moduloMesasControl) {
            const currentModuloMesas = moduloMesasControl.value;
            moduloMesasControl.setValue(!currentModuloMesas);
        }
    }



    getInfos() {
        this.CompanySettingsService.getAllInfos()
            .pipe(
                map((response: any) => response.items as Company[])
            )
            .subscribe(
                (company: Company[]) => {
                    this.company = company;
                    this.companyInfo = company[0];
                    this.mapCompanyInfoToForm(); // Chamar a função para preencher o formulário
                },
                // ... lidar com erro ...
            );


    }

    toggleEditMode() {
      this.EditMode = !this.EditMode;
      if (this.EditMode) {
          this.formCad.get('codigo_regime_tributario')?.disable();
      } else {
          this.formCad.get('codigo_regime_tributario')?.enable();
      }
    }

  salvarConfiguracoes(): void {
    console.log('Nome da Empresa:', this.empresa);
    console.log('Segmento:', this.segmento);
    console.log('Módulo de Mesas:', this.moduloMesas);
  }

}
