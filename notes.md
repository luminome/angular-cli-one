ng g c product/product-create-form --module=app.module.ts 
ng g c is equivalent to ng generate component


https://www.angularjswiki.com/angular/angular-material-icons-list-mat-icon-list/#mat-icon-list-category-action


ng g c product/product-traverse --module=app.module.ts


https://api.dictionaryapi.dev/api/v2/entries/en/hello



ng g c product/product-create-form/product-define --module=app.module.ts
ng generate model entities/product-meaning --module=app.module.ts ?

Because a model is a class, to generate it use --type option like this:

ng generate class hero --type=model


const flatMeta = (m:object, a:[] | any) => {
Object.entries(m).map(([key, val]) => 
    (val && typeof val === 'object' && !val.hasOwnProperty('val')) && flatMeta(val,a) ||
    (val && typeof val === 'object') && a.push(val)
)
return [...new Set([...a])];
}



    <div *ngFor="let meaning of productMeanings">
        <mat-card >
            <div>
            <button mat-icon-button class="delete" (click)="formDeleteMeaning(meaning)" aria-label="Delete completely">
                <mat-icon color="warn">delete_forever</mat-icon>
            </button>
            </div>
            <!-- <div><div class="card-label">Meaning for {{ meaning.pos.txt }} "{{ meaning.word }}" (.{{ meaning.pos.val }}):</div></div> -->
        </mat-card>


        <div class="def-row" *ngFor="let i = index; let definition of meaning.definitions">
            <div class="def-row-number">
                {{i+1}}
                <button mat-icon-button class="delete" (click)="formADeleteDefinition(meaning, definition)" aria-label="Delete completely">
                    <mat-icon color="warn">delete_forever</mat-icon>
                </button>
            </div>
            <div class="def-row-content">
                <mat-form-field subscriptSizing="dynamic" class="example-full-width" appearance="fill" (change)="definitionChanged($event, meaning, definition, 'text')">
                    <mat-label>Definition</mat-label>
                    <input matInput required placeholder="{{definition.definition}}">
                </mat-form-field>
                <mat-form-field subscriptSizing="dynamic" class="example-full-width" appearance="fill" (change)="definitionChanged($event, meaning, definition, 'example')">
                    <mat-label>Usage Example</mat-label>
                    <input matInput placeholder="{{definition.example}}">
                </mat-form-field>
            </div>
        </div>
        <!-- <mat-list>
            <mat-list-item *ngFor="let i = index; let definition of meaning.definitions">
                {{i+1}}.
                <mat-form-field class="example-full-width" appearance="fill">
                    <mat-label>Definition</mat-label>
                    <textarea matInput placeholder="{{definition.text}}"></textarea>
                  </mat-form-field>
            </mat-list-item>
        </mat-list> -->

        <button mat-button class="delete" aria-label="Delete completely" (click)="formAddDefinition(meaning)">
            <mat-icon color="primary">add</mat-icon> Add Definition
        </button>
    </div>