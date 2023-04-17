import {
    ComponentRef,
    Directive,
    ElementRef,
    HostBinding,
    Input,
    Renderer2,
    ViewContainerRef,
} from '@angular/core';
import { ProductDefineComponent } from "src/app/product/product-define/product-define.component";
import { IProduct } from 'src/app/entities/product/product.model';

@Directive({
    selector: '[appLoader]',
})
export class LoaderDirective {
    @HostBinding('class.with-loader') isVisible = false;

    private product: IProduct | null = null;

    @Input() set appLoader(showLoader: IProduct | null) {
        this.product = showLoader;
        if (showLoader !== null) {
            this.showComponent();
        } else {
            this.hideComponent();
        }
    }

    private cmpRef: ComponentRef<ProductDefineComponent> = null as any;

    private get contentEl(): HTMLElement {
        return this.el.nativeElement;
    }

    private get loaderEl(): HTMLElement {
        return this.cmpRef.location.nativeElement;
    }

    private get loaderViewIdx(): number {
        return this.vcr.indexOf(this.cmpRef.hostView);
    }

    constructor(
        private readonly el: ElementRef,
        private readonly vcr: ViewContainerRef,
        private readonly renderer: Renderer2
    ) { }

    private showComponent(): void {
        if (this.isVisible) {
            this.cmpRef.instance.product = this.product;
            this.cmpRef.instance.directPrepareProduct();
            return;
        }

        this.createComponent();
        this.changeLoaderElParent();
        this.isVisible = true;
        console.log('showComponent opened');
    }

    private createComponent(): void {
        this.cmpRef = this.vcr.createComponent(ProductDefineComponent);
        this.cmpRef.instance.product = this.product;
        this.cmpRef.instance.showDefs = true; 
    }

    private changeLoaderElParent(): void {
        this.renderer.appendChild(this.contentEl, this.loaderEl);
    }

    private hideComponent(): void {
        if (!this.isVisible) {
            return;
        }

        this.removeComponent();
        this.isVisible = false;
        console.log('showComponent voided');
    }

    private removeComponent(): void {
        this.vcr.remove(this.loaderViewIdx);
    }
}

  //https://medium.com/javascript-everyday/changing-parent-element-of-dynamic-angular-component-7f636f669276