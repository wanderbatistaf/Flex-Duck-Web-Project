import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService, CompanySettingsService, EncryptionService, ViaCepService} from "@app/_services";
import {map} from "rxjs/operators";
import { Company, Modulo} from "@app/_models";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ModulosService} from "@app/_services/modulos.service";
import {ActivatedRoute, Router} from "@angular/router";

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
  formCad: FormGroup;
  formMod: FormGroup;
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
  editingMode = false;
  editSaveButtonText = 'Editar';
  savingModalVisible: boolean = false;
  loadingPageModalVisible: boolean = false;
  modules?: Modulo[];
  modulosAtivos: any;
  isReady: boolean = false;


  constructor(private fb: FormBuilder,
              private viaCepService: ViaCepService,
              private CompanySettingsService: CompanySettingsService,
              private ModulosService: ModulosService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute,
              private encryptionService: EncryptionService) {

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
        pix_key: ['']
    });

    this.formMod = this.fb.group({
      id: ['', [Validators.minLength(1)]],
      modulo: [''],
      status: [''],
      moduloMesas: [''],
      moduloVarejo: [''],
      moduloServicos: ['']
    });

  }

    mapCompanyInfoToForm() {
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
            pix_key: this.companyInfo?.pix_key || ''
        });
    }

  ngOnInit(): void {
    this.loadingPageModalVisible = true;

    this.getInfos();
    this.getModules();
    this.formCad.get('codigo_regime_tributario')?.disable();

    this.ModulosService.getModules().subscribe((response: any) => {
      const modulos = response.modulos;

      const moduloMesas = modulos.find((modulo: any) => modulo.modulo === 'Mesas');
      if (moduloMesas) {
        this.formMod.get('moduloMesas')?.setValue(moduloMesas.status === 'true');
      }

      const moduloVarejo = modulos.find((modulo: any) => modulo.modulo === 'Varejo');
      if (moduloVarejo) {
        this.formMod.get('moduloVarejo')?.setValue(moduloVarejo.status === 'true');
      }

      const moduloServicos = modulos.find((modulo: any) => modulo.modulo === 'Varejo');
      if (moduloServicos) {
        this.formMod.get('moduloServicos')?.setValue(moduloServicos.status === 'true');
      }

      this.loadingPageModalVisible = false;
    });
  }



  searchZipCode(cep: string) {
    cep = cep.replace(/\D/g, '');
    if (cep !== '') {
      const cepValidate = /^[0-9]{8}$/;
      if (cepValidate.test(cep)) {
        this.viaCepService.getAddress(cep).subscribe(
            res => {
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
    this.savingModalVisible = true; // Mostrar o modal de salvamento
    this.ModulosService.toggleModuloMesasStatus().subscribe((newModule: Modulo) => {
      if (newModule) {
        // Limpar informações do localStorage
        localStorage.removeItem('modules');

        // Recarregar o sidebar
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.navigate(['/sidebar'], { queryParams: { refresh: new Date().getTime() } });

        // Aguardar um tempo para garantir que o sidebar seja recarregado
        setTimeout(() => {
          this.savingModalVisible = false; // Esconder o modal de salvamento após o sidebar ser recarregado
        }, 1000); // 1000 milissegundos (1 segundo)
      }
    });
  }




  toggleModuloVarejo() {
    this.savingModalVisible = true; // Mostrar o modal de salvamento
    this.ModulosService.toggleModuloVarejoStatus().subscribe((newModule: Modulo) => {
      if (newModule) {
        // Limpar informações do localStorage
        localStorage.removeItem('modules');

        // Recarregar o sidebar
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.navigate(['/sidebar'], { queryParams: { refresh: new Date().getTime() } });

        // Aguardar um tempo para garantir que o sidebar seja recarregado
        setTimeout(() => {
          this.savingModalVisible = false; // Esconder o modal de salvamento após o sidebar ser recarregado
        }, 1000); // 1000 milissegundos (1 segundo)
      }
    });
  }

  toggleModuloServicos() {
    this.savingModalVisible = true; // Mostrar o modal de salvamento
    this.ModulosService.toggleModuloVarejoStatus().subscribe((newModule: Modulo) => {
      if (newModule) {
        // Limpar informações do localStorage
        localStorage.removeItem('modules');

        // Recarregar o sidebar
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.navigate(['/sidebar'], { queryParams: { refresh: new Date().getTime() } });

        // Aguardar um tempo para garantir que o sidebar seja recarregado
        setTimeout(() => {
          this.savingModalVisible = false; // Esconder o modal de salvamento após o sidebar ser recarregado
        }, 1000); // 1000 milissegundos (1 segundo)
      }
    });
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

  isEditMode() {
    return this.EditMode;
  }

  updateCompany() {
    const updateCompany: Company = { ...this.formCad.value };
    const companyId: number | undefined = 1; // Substitua pelo ID da empresa correto

    this.CompanySettingsService.updateCompanyInfos(companyId, updateCompany)
      .subscribe(
        updatedCompany => {
          this.formCad.disable();
          this.toggleEditMode(); // Volte para o modo de edição após salvar
        },
        error => {
          console.error('Erro ao atualizar informações da empresa:', error);
        }
      );
  }

  saveCompanyInfos() {
    if (!this.EditMode) {
      this.savingModalVisible = true; // Mostrar o modal de salvamento

      const updateCompany: Company = this.formCad.value;
      const companyId: number | undefined = 1;

      this.CompanySettingsService.updateCompanyInfos(companyId, updateCompany)
        .subscribe(
          updatedCompany => {
            this.formCad.disable();
            this.savingModalVisible = false; // Esconder o modal de salvamento após o sucesso
          },
          error => {
            console.error('Erro ao atualizar informações da empresa:', error);
            this.savingModalVisible = false; // Esconder o modal de salvamento em caso de erro
          }
        );
    }
    this.EditMode = true;
  }

  getModules(): void {
    this.ModulosService.getModules()
      .subscribe(modules => {
        this.modules = modules;
      });
  }


}
