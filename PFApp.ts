
class PFApp {
    public printFriendlyModal: HTMLDivElement;
    public printFriendlyMode: boolean = false;
    private _targetPrompt: HTMLDivElement;
    private _printFriendlyMessage: string = 'Ctrl-P to print again as-is. Or select content to customize your print out';
    private _allowCustomSelections: boolean = true;
    private _includePrintFriendlyStyle: boolean = true;

    private _printFriendlyDragging: boolean = false;
    private _printFriendlyMouseIsDown: boolean = false;
    private _printFriendlyTimer: any = null;
    private _printFriendlyThrottle: number = 400;
    private _spreadDirection: number = 1;
    private _printFriendlyMousedownTime: number = 0;
    private _printFriendlyDraggingContent: any = null;

    private _currentElementDragStartHandler: any = null;
    private _currentElementDragEndHandler: any = null;
    private _targetDivDragOverHandler: any = null;
    private _targetDivDragEnterHandler: any = null;
    private _targetDivDragLeaveHandler: any = null;
    private _targetDivDropHandler: any = null;
    private _lastRunTimer: number = 0;

    get printFriendlyMessage() {
        return this._printFriendlyMessage;
    }
    set printFriendlyMessage(value: any) {
        this._targetPrompt.innerHTML = value;
        this._printFriendlyMessage = value;
    }

    get allowCustomSelections() {
        return this._allowCustomSelections;
    }
    set allowCustomSelections(value: any) {
        this._allowCustomSelections = value;
    }

    get includePrintFriendlyStyle() {
        return this._includePrintFriendlyStyle;
    }
    set includePrintFriendlyStyle(value: boolean) {
        if (value == true){
            document.querySelector('#PrintFriendlyStyle').remove();
        }
        else {
            this.createStyleElement();
        }
        this._includePrintFriendlyStyle = value;
    }

    public constructor() {
        const self = this;
        document.addEventListener('mouseup', (event) => {
            if (self.printFriendlyMode) {
                if (new Date().getTime() - self._printFriendlyMousedownTime < 200) { //this is a click
                    self.unhighlightElements();
                    self._printFriendlyMouseIsDown = false;
                    clearInterval(self._printFriendlyTimer);
                } else {
                    event.stopPropagation();
                    event.preventDefault();
                    clearInterval(self._printFriendlyTimer);
                    self._printFriendlyMouseIsDown = false;
                }
            }
        });

        self._currentElementDragStartHandler = this.selectedElementDragStart.bind(self);
        self._currentElementDragEndHandler = this.selectedElementDragEnd.bind(self);
        self._targetDivDragOverHandler = this.dragOverTargetDiv.bind(self);
        self._targetDivDragEnterHandler = this.dragEnterTargetDiv.bind(self);
        self._targetDivDragLeaveHandler = this.dragLeaveTargetDiv.bind(self);
        self._targetDivDropHandler = this.addDropContentEvent.bind(self);

        self.createStyleElement();
        self.createPrintFriendlyInterface();
        self.addprintFriendlyEventsToPageElements();

        document.addEventListener('keydown', (event) => self.toggleprintFriendlyMode(event));
    }

    createStyleElement() {
        const self = this;
        if (self.includePrintFriendlyStyle) {
            const style = document.createElement('style');
            style.id = "PrintFriendlyStyle";
            style.innerHTML = `
                .pfapp.printFriendlyMode:after {
                    content: " ";
                    z-index: 10;
                    display: block;
                    position: absolute;
                    height: 100%;
                    top: 0;
                    left: 0;
                    right: 0;
                    opacity: 1;
                    pointer-events:all;
                    border: dashed 1px black;
                    background-color: rgba(255,0,0,.2);
                    cursor: copy;
                }
                .pfapp.printFriendlyMode:nth-of-type(1n):after{
                    background-color: rgba(255,0,0,.2);
                }
                .pfapp.printFriendlyMode:nth-of-type(2n):after{
                    background-color: rgba(0,255,0,.2);
                }
                .pfapp.printFriendlyMode:nth-of-type(3n):after{
                    background-color: rgba(0,0,255,.2);
                }
                .pfapp.printFriendlyMode:nth-of-type(4n):after{
                    background-color: rgba(255,255,0,.2);
                }
                .pfapp.printFriendlyMode:nth-of-type(5n):after{
                    background-color: rgba(255,0,255,.2);
                }
                .pfapp.printFriendlyMode:nth-of-type(6n):after{
                    background-color: rgba(0,255,255,.2);
                }
        
                .pfapp.printFriendlyMode,.selectedElement.positionFixer {
                    position: relative;
                }
                .selectedElement {
                    
                }
                .selectedElement:after {
                  background-color: rgba(255,0,0,.2);
                  content: " ";
                  z-index: 10;
                  display: block;
                  position: absolute;
                  height: 100%;
                  top: 0;
                  left: 0;
                  right: 0;
                  opacity: 1;
                  pointer-events:all;
                  border: dashed 1px black;
                  cursor: copy;
                }
                .document__print-friendly {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    min-width: 200px;
                    min-height: 300px;
                    background-color: white;
                    border: 1px solid black;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                    z-index: 9999;
                    display:none;
                }
                .print-friendly__header {
                    background-color: silver;
                    color: black;
                    height: 24px;
                    line-height: 24px;
                    padding: 3px;
                    font-family: sans-serif;
                }
                .print-friendly__footer {
                    background-color: silver;
                    color: black;
                    height: 30px;
                    width: 100%;
                    line-height: 30px;
                    padding: 0px;
                    position: relative;
                    
                }
                .print-friendly__target__outerholder {
                    height: 350px;
                    width: 270px;
                    margin: 6px;
                    border: solid 1px black;
                    position: relative;
                    z-index: 10;
                    overflow: auto;
                }
                .print-friendly__target {
                    height: calc(500% - 20px);
                    width: calc(500% - 20px);
                    position: absolute;
                    top: 0;
                    left: 0;
                    transform: scale(0.2);
                    transform-origin: top left;
                    border: solid 10px rgba(0,0,0,0);
                }
                .print-friendly__targetPrompt {
                    height: calc(100% - 75px);
                    margin: 0px 20px 0px 20px;
                    position: absolute;
                    z-index: 5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    top: 30px;
                }
                .header__close-div {
                    display: inline-block;
                    float: right;
                    border: solid thin black;
                    border-radius: 30px;
                    width: 24px;
                    height: 24px;
                    text-align:center;
                    cursor: pointer;
                }
                .print-friendly__target__container {
                    cursor: crosshair;
                    background-color: rgba(255,0,0,.5);
                }
                .print-friendly__target__container:hover {
                        filter: grayscale(1);
                        opacity: .5;
                }
            `;

            document.body.appendChild(style);
        }
    }

    createPrintFriendlyInterface() {
        const self = this;
        self.printFriendlyModal = document.createElement('div');
        self.printFriendlyModal.classList.add('document__print-friendly');
        self.printFriendlyModal.classList.add('pfapp-ignore');
        document.body.appendChild(self.printFriendlyModal);

        const printFriendlyModalHeader = document.createElement('div');
        printFriendlyModalHeader.classList.add('print-friendly__header');
        self.printFriendlyModal.appendChild(printFriendlyModalHeader);

        const headerText = document.createElement('span');
        headerText.innerText = 'Print Friendly';
        printFriendlyModalHeader.appendChild(headerText);

        // Create close div and append to printFriendlyModalHeader
        const printFriendlyModalHeaderCloseButton = document.createElement('div');
        printFriendlyModalHeaderCloseButton.classList.add('header__close-div');
        printFriendlyModalHeaderCloseButton.innerText = 'X';
        printFriendlyModalHeader.appendChild(printFriendlyModalHeaderCloseButton);
        // Add click event listener to close div
        printFriendlyModalHeaderCloseButton.addEventListener('click', () => {
            self.printFriendlyMode = false;
            self.printFriendlyModal.style.display = 'none';
        });

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('print-friendly__target__outerholder');
        self.printFriendlyModal.appendChild(contentDiv);

        const targetDiv = document.createElement('div');
        targetDiv.classList.add('print-friendly__target');
        contentDiv.appendChild(targetDiv);
        targetDiv.addEventListener('dragover', (event) => self.dragOverTargetDiv(event));
        targetDiv.addEventListener('dragenter', (event) => self.dragEnterTargetDiv(event));
        targetDiv.addEventListener('dragleave', (event) => self.dragLeaveTargetDiv(event));
        targetDiv.addEventListener('drop', (event) => self.addDropContentEvent(event));

        self._targetPrompt = document.createElement('div');
        self._targetPrompt.classList.add('print-friendly__targetPrompt');
        self._targetPrompt.innerHTML = self._printFriendlyMessage;
        self.printFriendlyModal.appendChild(self._targetPrompt);

        const footerDiv = document.createElement('div');
        footerDiv.classList.add('print-friendly__footer');
        self.printFriendlyModal.appendChild(footerDiv);
    }

    dragEnterTargetDiv() {
    }

    dragOverTargetDiv(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        (event.currentTarget as HTMLElement).style.border = '10px dashed black';
    }

    dragLeaveTargetDiv(event) {
        event.preventDefault();
        event.currentTarget.style.border = '10px dashed rgba(0,0,0,0)';
    }

    addDropContentEvent(event) {
        const self = this;
        event.preventDefault();
        event.currentTarget.style.border = '10px dashed rgba(0,0,0,0)';
        if (self._printFriendlyDragging) {
            this.dropContent(event,false);
        }
        self._printFriendlyDraggingContent = null;
        self._printFriendlyDragging = false;
    }

    insertDropContentEvent(event) {
        const self = this;
        event.preventDefault();
        if (self._printFriendlyDragging) {
            this.dropContent(event,true);
        }
        self._printFriendlyDraggingContent = null;
        self._printFriendlyDragging = false;
    }

    dropContent(event: any, insertBefore: boolean = false){
        const self = this;
        const dropTarget = document.querySelector('.print-friendly__target') as HTMLElement;
        dropTarget.style.border = 'none';

        const draggingContentContainer = document.createElement('div');
        draggingContentContainer.classList.add('print-friendly__target__container');
        if (insertBefore) {
            dropTarget.insertBefore(draggingContentContainer, event.currentTarget);
        }
        else {
            dropTarget.appendChild(draggingContentContainer);
        }
        draggingContentContainer.addEventListener('mouseup', (event) => self.droppedContentMouseupEvent(event));
        draggingContentContainer.addEventListener('dragover', (event) => self.dragOverTargetDiv(event));
        draggingContentContainer.addEventListener('dragleave', (event) => self.dragLeaveTargetDiv(event));
        draggingContentContainer.addEventListener('drop', (event) => self.insertDropContentEvent(event));
        self._printFriendlyDraggingContent.classList.remove('printFriendlyMode');
        if (document.querySelectorAll(".selectedElement").length > 1){
            document.querySelectorAll(".selectedElement").forEach((currentElement) => {
                draggingContentContainer.innerHTML += currentElement.outerHTML;
            });
        }
        else {
            draggingContentContainer.innerHTML += self._printFriendlyDraggingContent.outerHTML;
        }

    }

    droppedContentMouseupEvent(event) {
        //remove content that has been added to the selected print items
        event.currentTarget.remove();
        document.querySelectorAll('.print-friendly__target__container').forEach((currentElement) =>{
            if (currentElement.children.length == 0){
                currentElement.remove();
            }
        })
    }

    addprintFriendlyEventsToPageElements() {
        const self = this;
        // Get all elements on the page
        document.addEventListener('mousedown', (event) => self.printFriendlyMousedown(event));
    }

    printFriendlyMousedown(event) {
        const self = this;
        self._printFriendlyMousedownTime = new Date().getTime();
        self._lastRunTimer = new Date().getTime();
        self._printFriendlyThrottle = 400;
        self._spreadDirection = 1;
        if (self.allowCustomSelections == false || event.target.classList.contains('pfapp') || self.printFriendlyModal.contains(event.target)) {
            return;
        }
        if (!self.printFriendlyMode || self._printFriendlyDragging ||
            event.target.classList.contains('selectedElement') ||
            (event.target as HTMLElement).classList.contains('pfapp-ignore')) return;

        self._printFriendlyMouseIsDown = true;
        if (!self._printFriendlyDragging) {
            event.stopPropagation();
            event.preventDefault();

            document.querySelectorAll('.selectedElement').forEach((current) => {
                current.classList.remove('selectedElement');
                (current as HTMLElement).draggable = false;
            });

            self.highlightCurrentElement(event.target);

            // start traversing up the DOM
            self.moveToParent(event.target);
        }
    }

    unhighlightElements(querySelector: string = null, classesToClear: string[] = ['selectedElement','positionFixer']){
        const self = this;
        querySelector = querySelector == null ? '.selectedElement,.pfapp' : querySelector;
        const highlightedElements: NodeListOf<Element>  = document.querySelectorAll(querySelector);
        classesToClear.forEach((currentClass) => {
            highlightedElements.forEach((element) => element.classList.remove(currentClass));
        });
        highlightedElements.forEach((element) => element.removeAttribute('draggable'));

        self.updateAllPFAppElementEvents();
    }

    highlightCurrentElement(element: HTMLElement) {
        const self = this;
        if (!element.classList.contains('pfapp')) {
            element.classList.add('selectedElement');
            if (['absolute', 'relative'].indexOf(window.getComputedStyle(element).position) == -1) {
                element.classList.add('positionFixer');
            }
            element.setAttribute('draggable', 'true');

            element.removeEventListener('dragstart', self.selectedElementDragStart);
            element.removeEventListener('dragend', self._currentElementDragEndHandler);

            element.addEventListener('dragstart', (event) => self.selectedElementDragStart(event));
            element.addEventListener('dragend', self._currentElementDragEndHandler);
        }
    }

    selectedElementDragStart(event){
        const self = this;
        self._printFriendlyDragging = true;
        event.dataTransfer.setData('text/plain', event.target.outerHTML);
        self._printFriendlyDraggingContent = event.target.cloneNode(true);
        self._printFriendlyDraggingContent.querySelectorAll('.pfapp-ignore').forEach((current) => {
            current.remove();
        });
        self._printFriendlyDraggingContent.classList.remove('selectedElement');
        self._printFriendlyDraggingContent.draggable = false;
    }

    selectedElementDragEnd(){
        const self = this;
        self._printFriendlyDragging = false;
        if (self.printFriendlyModal.querySelector('.print-friendly__target').children.length > 0){
            (self.printFriendlyModal.querySelector('.print-friendly__targetPrompt') as HTMLElement).style.display = "none";
        }
        else {
            (self.printFriendlyModal.querySelector('.print-friendly__targetPrompt') as HTMLElement).style.display = "";
        }
    }

    spreadToSiblings(target: HTMLElement, siblings: HTMLElement[]) {
        const self = this;
        let startingIndex = Array.from(target.parentElement.children).indexOf(target);
        if (self._spreadDirection == 1) {
            for (let i = startingIndex; i < siblings.length; i++) {
                if (!siblings[i].classList.contains('selectedElement')) {
                    if (!(siblings[i].classList.contains('pfapp') || siblings[i].classList.contains('pfapp-ignore'))) {
                        siblings[i].classList.add('selectedElement');
                        siblings[i].classList.add('positionFixer');
                        i = siblings.length + 1;
                    }
                }
            }
        } else if (startingIndex > 0 && startingIndex <= siblings.length) {
            for (let i = startingIndex - 1; i >= 0; i--) {
                if (!siblings[i].classList.contains('selectedElement')) {
                    if (!(siblings[i].classList.contains('pfapp') || siblings[i].classList.contains('pfapp-ignore'))) {
                        siblings[i].classList.add('selectedElement');
                        siblings[i].classList.add('positionFixer');
                        i = -1;
                    }
                }
            }
        }
    }

    moveToParent(target: HTMLElement) {
        const self = this;
        // Set a timer to move the highlight to the parent element every second
        self._printFriendlyTimer = setInterval(() => {
            if (new Date().getTime() - this._lastRunTimer > self._printFriendlyThrottle) {
                if (self._printFriendlyMouseIsDown) {
                    self._printFriendlyThrottle = self._printFriendlyThrottle > 25 ? self._printFriendlyThrottle - 25 : 25;
                    self._spreadDirection = self._spreadDirection == -1 ? 1 : -1;
                    // Check if the target element is null
                    if (!target || self._printFriendlyDragging || (target &&
                        target.classList.contains('pfapp-ignore') &&
                        target.classList.contains('pfapp'))
                    ) {
                        // If the target is null, stop the timer
                        clearInterval(self._printFriendlyTimer);
                        return;
                    }

                    // Find the sibling elements of the target element
                    let siblings: HTMLElement[] = self.findSiblingElements(target);
                    let moveUp: boolean = true;
                    siblings.forEach((currentSibling: HTMLElement) => {
                        if (
                            !(currentSibling.classList.contains('selectedElement') ||
                                currentSibling.classList.contains('pfapp') ||
                                currentSibling.classList.contains('pfapp-ignore'))) {
                            moveUp = false;
                        }
                    });

                    if (!moveUp) {
                        self.spreadToSiblings(target, siblings);
                    } else { //Time to start moving up elements
                        // Remove the "highlight" class from the target element
                        //target.classList.remove('selectedElement', 'positionFixer');
                        //target.removeAttribute('draggable');
                        self.unhighlightElements();

                        // Set the target to the parent element, if it exists
                        if (target.parentElement && target.parentElement != document.body) {
                            target = target.parentElement;
                            // Add the "highlight" class to the new target element
                            self.highlightCurrentElement(target);
                        } else if (target.parentElement == document.body) {
                            target = target.parentElement;
                            // Add the "highlight" class to the new target element
                            self.highlightCurrentElement(target);
                            clearInterval(self._printFriendlyTimer);
                        } else {

                            // If the parent element does not exist, stop the timer
                            clearInterval(self._printFriendlyTimer);
                        }
                    }
                }
                self._lastRunTimer = new Date().getTime();
            }
        }, 25);
    }

    findSiblingElements(element: HTMLElement): HTMLElement[] {
        // Get all the children of the parent element
        if (element.parentElement == null) {
            return [];
        }
        else {
            const children = element.parentElement.children;
            // Filter out the element itself and return the siblings
            return Array.from(children).filter((child) => child !== element) as HTMLElement[];
        }
    }

    toggleprintFriendlyMode(event: KeyboardEvent) {
        const self = this;
        if (self.allowCustomSelections == false && document.querySelector('.selectedElement') == null) {
            return;
        }
        if (event.key === 'p' && event.ctrlKey) {
            self.enterprintFriendlyMode();
        } else if (event.key === 'Escape') {
            if (document.querySelector('.selectedElement') != null){
                self.unhighlightElements();
            }
            else {
                self.exitprintFriendlyMode();
            }
        }
    }

    enterprintFriendlyMode(){
        const self = this;
        if (!self.printFriendlyMode) {
            event.preventDefault();
        }
        self.printFriendlyModal.querySelectorAll('*').forEach((currentElement) => {
            (currentElement as HTMLElement).classList.add('pfapp-ignore');
        });

        self.printFriendlyMode = true;
        self.printFriendlyModal.style.display = 'block';

        self.updateAllPFAppElementEvents();
    }

    updateAllPFAppElementEvents() {
        const self = this;
        document.body.querySelectorAll('.pfapp').forEach((currentElement) =>{
            if (!self.printFriendlyModal.contains(currentElement)) {
                const hElement: HTMLElement = currentElement as HTMLElement;
                hElement.classList.add('printFriendlyMode')
                hElement.setAttribute('draggable', 'true');

                hElement.removeEventListener('dragstart', self.selectedElementDragStart);
                hElement.removeEventListener('dragend', self._currentElementDragEndHandler);

                hElement.addEventListener('dragstart', (event) => self.selectedElementDragStart(event));
                hElement.addEventListener('dragend', self._currentElementDragEndHandler);
            }
        });
    }

    exitprintFriendlyMode(){
        const self = this;
        self.printFriendlyMode = false;
        self.printFriendlyModal.style.display = 'none';
        self.unhighlightElements(null,['selectedElement','positionFixer','printFriendlyMode']);

    }
}
