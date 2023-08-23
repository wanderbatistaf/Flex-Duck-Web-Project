import * as CryptoJS from 'crypto-js/core';
import * as AES from 'crypto-js/aes';
import * as Utf8 from 'crypto-js/enc-utf8';
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private encryptionKey: string = 'sua_chave_de_criptografia_secreta'; // Substitua pela sua chave secreta

  encryptData(data: any): string {
    const encryptedData = AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
    return encryptedData;
  }

  decryptData(encryptedData: string): any {
    const decryptedData = AES.decrypt(encryptedData, this.encryptionKey);
    const decryptedText = decryptedData.toString(Utf8);
    return JSON.parse(decryptedText);
  }
}
