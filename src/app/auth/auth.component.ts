import { Component,OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit{
visible: boolean=true
selectedLanguage = 'en';
languageCodes = ['en', 'de'];
  languages:any = {
    en: 'English',
    de: 'German',
    // es: 'Spanish',
    // ds: 'Dutch',
    // Add more language codes and their corresponding names here
  };
constructor(public translate: TranslateService){
  this.translate.addLangs(this.languageCodes);
  translate.setDefaultLang('en');

  translate.use('en');
  this.translate.onLangChange.subscribe(() => {
    this.setLoginText();
  });
  this.setLoginText();
}
loginText:any;
ngOnInit(): void {
  this.translate.onLangChange.subscribe(event => {
    // Update localStorage with the new language
    localStorage.setItem('lang', event.lang);
  });
  this.translate.get('AUTH.LOG_IN').subscribe(translation => {
    console.log('Translation for "AUTH.LOG_IN":', translation); // For debugging
    this.loginText=translation
  });
const loginBtn:any = document.getElementById('login'); // Select the login button

loginBtn.addEventListener('click', () => {
  const togglePanel:any = document.getElementById('panel'); // Target the toggle panel
  togglePanel.classList.toggle('active'); // Toggle the 'active' class on the toggle panel
});

}
setLoginText(): void {
  const currentLang = this.translate.currentLang;
  // Fetch translation from i18n JSON file based on current language
  this.translate.get('AUTH.LOG_IN').subscribe((translatedText: string) => {
    this.loginText = translatedText;
  });
}
}
