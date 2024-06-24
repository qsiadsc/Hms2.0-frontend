import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Constants } from '../../common-module/Constants'

@Injectable()
export class UrlEncryptDecryptService {
  transitmessage;
  jsonObject;

  constructor() { }

  urlEncryption(plan, transitmessage) {
    var keySize = 256;
    var ivSize = 128;
    var iterations = 100;
    var password = Constants.encryptDecryptPassword;
    var salt = CryptoJS.lib.WordArray.random(128/8);
    var key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize/32,
      iterations: iterations
    });

    var iv = CryptoJS.lib.WordArray.random(128/8);
    var encrypted = CryptoJS.AES.encrypt(plan, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
  
    this.transitmessage = salt.toString()+ iv.toString() + encrypted.toString();
    return transitmessage = this.transitmessage;
  }

  urlDecryption(plan, jsonObject) {
    var keySize = 256;
    var ivSize = 128;
    var iterations = 100;
    var password = Constants.encryptDecryptPassword;
    var salt = CryptoJS.enc.Hex.parse(plan.substr(0, 32));
    var key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize/32,
      iterations: iterations
    });

    var iv = CryptoJS.enc.Hex.parse(plan.substr(32, 32))
    var encrypted = plan.substring(64);
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });
    var finalDecrypted = decrypted.toString(CryptoJS.enc.Utf8)
    this.jsonObject = JSON.parse(finalDecrypted);
    return jsonObject = this.jsonObject;
  }
}