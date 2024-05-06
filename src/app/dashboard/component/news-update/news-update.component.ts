import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AngularEditorComponent, AngularEditorConfig, UploadResponse } from '@kolkov/angular-editor';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { FormGroup, FormControl, Validators, MaxLengthValidator, FormBuilder } from '@angular/forms';
import { environment } from 'src/environment/enviroment';
import { NewsUpdateService } from 'src/app/services/newsUpdate.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Observer, of, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-news-update',
  templateUrl: './news-update.component.html',
  styleUrls: ['./news-update.component.scss'],
})
export class NewsUpdateComponent implements OnInit, OnDestroy {
  characterCount: number = 0;
  
  // maxCharacterCount = 800;
  textarea: string = '';
  @ViewChild('editor') editor: ElementRef | any;
  @ViewChild('colorPickerContainer') colorPickerContainer: ElementRef|any;
  // content:any;
  // title:any
  images: any[] = [];
  newsContent = new FormGroup({
    content: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
  });

  updateNews: boolean = false;
  newsId!: string;
  headerTitle:string=''
  headerDescription:string=''
  buttonName='Post'
  constructor(
    private http: HttpClient,
    private updateService: NewsUpdateService,
    private route: Router,
    private toastr: ToastrService,private translate:TranslateService,
    private fb: FormBuilder
  ) {
    // this.newsContent = this.fb.group({
    //   content: ['', Validators.compose([Validators.required, Validators.maxLength(this.maxCharacterCount)])],
    //   title: ['', Validators.required],});
  }

  // ngOnInit(): void {
  //   let data: any = this.updateService.news;
  //   this.newsId = data._id;
  //   if (this.newsId) {
  //     this.buttonName='Update'
  //     console.log(data, 'hii');
  //     this.updateNews = true;
  //     this.newsContent.patchValue({
  //       content: data.content,
  //       title: data.title,
  //     });
  //   }else{
  //     this.buttonName='Post'
  //   }
  // }

  ngOnInit(): void {
    let data: any = this.updateService.news;
    this.newsId = data?._id; // Use optional chaining to avoid errors if data is null
    this.translateTitle(); // Call translateTitle method
    this.translateDescription();
    this.buttonName = this.getButtonLabel();
    if (this.newsId) {
      console.log(data, 'hii');
      this.updateNews = true;
      this.newsContent.patchValue({
        content: data.content,
        title: data.title,
      });
    }
   
    this.updateMinHeight();
    window.addEventListener('resize', () => this.updateMinHeight());
  }

  countCharacters(event: any) {
    const editorContent = this.newsContent.get('content')?.value;
    if (editorContent) {
      // Remove non-character content using regular expression
      const cleanContent = editorContent.replace(/[^a-zA-Z]/g, '');
      // Count characters
      this.characterCount = cleanContent.length;
  
      // Allow backspace to work
      if (event.keyCode === 8) { // 8 is the key code for backspace
        return;
      }
  
      // Disable typing when character count exceeds 800
      if (this.characterCount >= 800) {
        event.preventDefault(); // Prevent further key presses
      }
    } else {
      this.characterCount = 0; // If content is null, set character count to 0
    }
  
    // Check if the target is the video input
    if (event.target.id === 'video-input') {
      // Allow only up to 3 characters in the video input
      if (event.target.value.length >= 3) {
      
        event.preventDefault();
      }
    }
  }
  
  
  disableEditor() {
    const editor = this.editor.editor.nativeElement;
    editor.blur(); // Blur the editor to disable typing
  }
  

  getButtonLabel(): string {
    return this.newsId ? 'UPDATE_NEWS_PAGE.UPDATE_BUTTON' : 'POST_NEWS_PAGE.POST_BUTTON';
  }

  translateTitle() {
    const titleKey = this.newsId ? 'UPDATE_NEWS_PAGE.HEADER_TITLE' : 'POST_NEWS_PAGE.HEADER_TITLE';
    this.translate.get(titleKey).subscribe((title: string) => {
      this.headerTitle = title; // Assign translated title to headerTitle property
    });
  }

  translateDescription() {
    const descriptionKey = this.newsId ? 'UPDATE_NEWS_PAGE.HEADER_DESCRIPTION' : 'POST_NEWS_PAGE.HEADER_DESCRIPTION';
    this.translate.get(descriptionKey).subscribe((description: string) => {
      this.headerDescription = description; // Assign translated description to headerDescription property
    });
  }

  config: AngularEditorConfig = {
    editable: true,
    enableToolbar: false,
    showToolbar: true,
    spellcheck: true,
    minHeight: '20rem',
    maxHeight: '20rem',
    // minWidth: '100%',
    // width: '50rem',

    upload: (file: File): Observable<HttpEvent<UploadResponse>> => {
      console.log('file is', file);
      return Observable.create(
        (observer: Observer<HttpEvent<UploadResponse>>) => {
          // const maxDimension = 250;
          const maxDimension = 200; // Maximum width or height for the resized image

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const image = new Image();
          image.src = URL.createObjectURL(file);
          image.classList.add('insideNews'); // Add your class name here

          image.onload = () => {
            let width = image.width;
            let height = image.height;
            image.classList.add('insideNews');
            image.className = 'insideNews';
            // Resize the image if either dimension is greater than the maximum
            if (width > maxDimension || height > maxDimension) {
              // Calculate the new dimensions while maintaining aspect ratio
              if (width > height) {
                height *= maxDimension / width;
                width = maxDimension;
              } else {
                width *= maxDimension / height;
                height = maxDimension;
              }
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas with new dimensions
            ctx?.drawImage(image, 0, 0, width, height);

            // Convert canvas content to Blob
            canvas.toBlob((blob) => {
              if (!blob) {
                observer.error('Failed to resize image');
                return;
              }

              // Create FormData and append resized image
              const formData = new FormData();
              formData.append('file', blob, file.name);
              this.updateService.uploadNews(formData).subscribe(
                (response: any) => {
                  console.log('Upload successful:', response.body.imageUrl);
                  this.images.push(response.body.imageUrl);
                  observer.next(response);
                  observer.complete();
                },
                (error) => {
                  console.error('Upload failed:', error);
                }
              );
            }, file.type);
          };
        }
      );
    },
    placeholder: this.translate.instant('POST_NEWS_PAGE.EDITOR_PLACEHOLDER'),
    translate: 'no',
    sanitize: false,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [['insertVideo','toggleEditorMode']],
  };
  
  //Responsive for mobile
  updateMinHeight(): void {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) { // Adjust this breakpoint as needed for your design
      this.config.minHeight = '5.9rem'; // Set minHeight for mobile view
      this.config.maxHeight = '5.9rem';

    } else {
      this.config.minHeight = '20rem'; // Set default minHeight for larger screens
      this.config.maxHeight = '20rem';
    }
  }

  submitContent() {
    if (this.newsContent.valid) {
      console.log(this.newsContent.value);
      if (this.updateNews) {
        this.http
          .patch(
            environment.baseUrl + 'news/' + this.newsId,
            this.newsContent.value
          )
          .subscribe(
            (res: any) => {
              if (res.statusCode == 200) {
                this.toastr.success(res.message);

                this.route.navigate(['/', 'dashboard', 'news-list']);
              }
            },
            (error: HttpErrorResponse) => {
              console.log('error in api ', error);
              this.toastr.error(error.error.message);
            }
          );
      } else {
        console.log('news adding', this.images);
        this.updateService.postNews(this.newsContent.value).subscribe(
          (res: any) => {
            console.log(res);
            if (res.statusCode == 200) {
              this.toastr.success('News added successfully');
              this.route.navigate(['/', 'dashboard', 'news-list']);
            }
          },
          (error: HttpErrorResponse) => {
            console.log('error in api', error);
            this.toastr.error(error.error.message);
          }
        );
      }
    } else {
      this.toastr.error('Enter All Fields');
    }
  }

  // addVideo() {
  //   const videoLink = prompt("Please enter the video link:");
  //   if (videoLink) {
  //     const videoEmbedCode = `<iframe src="${videoLink}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
  //     this.editor.executeCommand('insertHtml', videoEmbedCode);
  //   }
  // }

  private videoCount: number = 0;

  addVideo() {
    if (this.videoCount >= 3) {
      alert('You can only add up to 3 videos.');
      return;
    }

    const videoLink = prompt('Please enter the YouTube video URL:');
    if (videoLink) {
      const videoId = this.getYouTubeVideoId(videoLink);
      if (videoId) {
        const videoEmbedCode = `<div>
                                  <iframe src="https://www.youtube.com/embed/${videoId}" style="position: relative; width: 100%; max-width: 500px; min-height: 250px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </div>`;
        this.editor.executeCommand('insertHtml', videoEmbedCode);
        this.videoCount++; // Increment the count after adding a video
      } else {
        alert('Invalid YouTube video URL.');
      }
    }
  }


  getYouTubeVideoId(url: string): string | null {
    const videoIdRegex =
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/;
    const match = url.match(videoIdRegex);
    return match ? match[1] : null;
  }

  ngOnDestroy(): void {
    this.updateService.news = [];
  }

  openColorPicker() {
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.style.position = 'fixed';
    colorPicker.style.top = '33%';
    colorPicker.style.left = '85%';
    colorPicker.style.transform = 'translate(-50%, -50%)';
    colorPicker.style.zIndex = '9999';
    colorPicker.addEventListener('input', () => {
      this.applyBackgroundColor(colorPicker.value);
    });
    document.body.appendChild(colorPicker); // append color picker to body
    colorPicker.click();
  }
  
  applyBackgroundColor(color: string) {
    const editor = this.editor.executeCommand();
    const selection = editor.executeCommand();
    
    if (selection && !selection.isCollapsed) {
      editor.model.change((writer:any) => {
        const firstPosition = writer.createPositionAt(selection.getFirstPosition());
        const lastPosition = writer.createPositionAt(selection.getLastPosition());
  
        writer.setAttribute('background', color, editor.model.createRangeIn(firstPosition, lastPosition));
      });
    } else {
      alert('Please select some text to apply color');
    }
  }
}