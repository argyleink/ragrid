import { Observable }      from 'rxjs'
import { RxStore, Logger } from './rxstore'

import * as Prism from 'prismjs'

export default class RagridDemo extends HTMLElement {
  createdCallback() {
    this.initial_state = {
      'horizontally-aligned':       '',
      'vertically-aligned':         '',
      'horizontally-distributed':   '',
      'vertically-distributed':     '',
      direction:                    'columns',
      order:                        '',
      minHeight:                    '500px',
      maxHeight:                    '',
      width:                        '3',
      boxes:                        4,
    }

    this.masonry = {
      boxes:                        8,
      minHeight:                    '500px',
      maxHeight:                    '90vh',
      'horizontally-aligned':       'left',
      'vertically-aligned':         'center',
      'horizontally-distributed':   '',
      'vertically-distributed':     '',
    }

    this.packery = {
      boxes:                        8,
      direction:                    'columns',
      'horizontally-aligned':       '',
      'vertically-aligned':         '',
      'horizontally-distributed':   'equal',
      'vertically-distributed':     'equal',
    }

    this.panel_controls = [
      {
        section: 'align-objects',
        buttons:  [
          { attr: 'horizontally-aligned', val: 'left',    title: 'Horizontally align to the left' },
          { attr: 'horizontally-aligned', val: 'center',  title: 'Horizontally align to the center' },
          { attr: 'horizontally-aligned', val: 'right',   title: 'Horizontally align to the right' },
          { attr: 'vertically-aligned',   val: 'top',     title: 'Vertically align to the top' },
          { attr: 'vertically-aligned',   val: 'center',  title: 'Vertically align to the center' },
          { attr: 'vertically-aligned',   val: 'bottom',  title: 'Vertically align to the bottom' },
        ],
      },
      {
        section: 'distribute-objects',
        buttons:  [
          { attr: 'horizontally-distributed', val: 'between', title: 'Horizontally distribute space between, edge to edge' },
          { attr: 'horizontally-distributed', val: 'around',  title: 'Horizontally distribute space evenly' },
          { attr: 'horizontally-distributed', val: 'equal',   title: 'Horizontally fill all space' },
          { attr: 'vertically-distributed',   val: 'between', title: 'Vertically distribute space between, edge to edge' },
          { attr: 'vertically-distributed',   val: 'around',  title: 'Vertically distribute space evenly' },
          { attr: 'vertically-distributed',   val: 'equal',   title: 'Vertically fill all space' },
        ],
      },
      {
        section: 'distribute-spacing',
        buttons: [
          { attr: 'direction', val: 'rows',     title: 'Rows' },
          { attr: 'direction', val: 'columns',  title: 'Columns' },
        ],
      }
    ]

    this.controls = [
      { attr:   'direction',
        val:    'masonry',
        title:  'Pack them in',
        text:   'Masonry',
      },
      { attr:   'direction',
        val:    'masonry',
        title:  'Pack them in from the left',
        text:   'Bottom Up Masonry',
      },
      { attr:   'direction',
        val:    'packery',
        title:  'Pack and fill top down',
        text:   'Packery',
      },
      { attr:   'direction',
        val:    'packery',
        title:  'Pack and fill from the left',
        text:   'Left Packery',
      },
      { attr:   'order',
        val:    'reverse',
        title:  'Reverse the order',
        text:   'Reverse',
      },
      { attr:   'order',
        val:    'forward',
        title:  'Forward the order',
        text:   'Forward',
      },
      { attr:   'vertically-aligned',
        val:    'baseline',
        title:  'Align to the box contents text baseline',
        text:   'Baseline Align',
      },
    ]

    // Create a store for our demo state
    this.Ragrid = RxStore(this.initial_state, {
      update:           patch =>      state => Object.assign({}, state, patch),
      add_box:          () =>         state => Object.assign({}, state, {boxes: state.boxes + 1}),
      set_minHeight:    minHeight =>  state => Object.assign({}, state, {minHeight}),
      set_width:        width =>      state => Object.assign({}, state, {width}),
    })

    // opt into nice state change logs
    Logger('RagridDemo', this.Ragrid.store$)
  }

  attachedCallback() {
    // our observable number to render on changes
    this.grid$ = this.Ragrid.store$.subscribe(grid => this.render(grid))
    
    this.align_panel$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('data-attr-key'))
      .map(e => {
        let new_state = {}
        new_state[e.target.dataset.attrKey] = e.target.dataset.attrVal

        // set masonry custom attributes
        if (e.target.dataset.attrVal == 'masonry')
          new_state = Object.assign(new_state, this.masonry)

        // set packery custom attributes
        if (e.target.dataset.attrVal == 'packery')
          new_state = Object.assign(new_state, this.packery)

        // set bottom up masonry attributes
        if (e.target.innerText == 'Bottom Up Masonry')
          new_state['horizontally-aligned'] = 'right'

        // set bottom up masonry attributes
        if (e.target.innerText == 'Left Packery')
          new_state['direction'] = 'rows'
        
        // set row settings 
        if (e.target.dataset.attrVal == 'rows')
          new_state.maxHeight = '90vh'

        return new_state
      })
      .subscribe(patch => this.Ragrid.actions.update(patch))

    this.add$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('ragrid-add'))
      .subscribe(e => this.Ragrid.actions.add_box())

    this.height$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('ragrid-auto-height'))
      .subscribe(e => this.Ragrid.actions.set_minHeight())

    this.width$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('ragrid-auto-width'))
      .subscribe(e => this.Ragrid.actions.set_width())

    this.reset$ = Observable.fromEvent(this, 'click')
      .filter(e => e.target.hasAttribute('ragrid-reset'))
      .subscribe(e => this.Ragrid.actions.update(this.initial_state))
  }

  detachedCallback() {
    this.grid$.unsubscribe()
    this.align_panel$.unsubscribe()
    this.add$.unsubscribe()
    this.reset$.unsubscribe()
  }

  attributeChangedCallback(attr, oldVal, newVal) {}
  
  render(grid) {
    this.innerHTML = `
      ${this.code_example(grid)}
      <div grid="columns">
        <nav>
          ${this.align_panel()}
          ${this.ragrid_specials()}
          ${this.grid_controls()}
        </nav>
        ${this.ragrid_demo(grid)}
      </div>
    `
    Prism.highlightElement(this.querySelector('code'))
  }

  code_example(grid) {
    return `<code class="language-markup" id="demo">
              &lt;div
                grid="${grid.direction}"
                ${ (grid['horizontally-aligned'] ? 'horizontally-aligned="' + grid['horizontally-aligned'] + '"' : '')}
                ${ (grid['vertically-aligned'] ? 'vertically-aligned="' + grid['vertically-aligned'] + '"' : '')}
                ${ (grid['horizontally-distributed'] ? 'horizontally-distributed="' + grid['horizontally-distributed'] + '"' : '')} 
                ${ (grid['vertically-distributed'] ? 'vertically-distributed="' + grid['vertically-distributed'] + '"' : '')}
                ${ (grid['order'] ? 'order="' + grid['order'] + '"' : '')}
              &gt;…&lt;/div&gt;
            </code>`
  }

  align_panel() {
    return `<div class="align-panel">
              ${this.panel_controls.reduce((controls, control) => 
                `${controls}
                <div class="controls ${control.section}" grid="columns" horizontally-distributed="equal">
                  ${control.buttons.reduce((items, item) => 
                    `${items}<button data-attr-key="${item.attr}" data-attr-val="${item.val}" title="${item.title}"></button>`
                  , '')}
                </div>
                `
              , '')}
              <img src="https://helpx.adobe.com/muse/using/using-align-panel-objects/_jcr_content/main-pars/procedure/proc_par/step_1/step_par/image.img.png/alignpanel.PNG"/>
            </div>`
  }

  ragrid_specials() {
    return `<div class="feature">
              <h4>Align Panel can't do this:</h4>
              ${this.controls.reduce((items, item) => 
                `${items}
                 <button data-attr-key="${item.attr}" data-attr-val="${item.val}" title="${item.title}">${item.text}</button>`
              , '')}
            </div>`
  }

  grid_controls() {
    return `<div class="feature">
              <h4>Demo Grid Controls:</h4>
              <button ragrid-reset>Reset</button>
              <button ragrid-add>Add Box</button>
              <button ragrid-auto-height>Auto Height</button>
              <button ragrid-auto-width>Auto Width</button>
            </div>`
  }

  ragrid_demo(grid) {
    return `<article ${grid.width ? 'style="flex:'+grid.width+';"' : ''}><section 
              style="min-height:${grid.minHeight};max-height:${grid.maxHeight};"
              grid="${grid.direction}" 
              ${ (grid['horizontally-aligned'] ? 'horizontally-aligned="' + grid['horizontally-aligned'] + '"' : '')}
              ${ (grid['vertically-aligned'] ? 'vertically-aligned="' + grid['vertically-aligned'] + '"' : '')}
              ${ (grid['horizontally-distributed'] ? 'horizontally-distributed="' + grid['horizontally-distributed'] + '"' : '')} 
              ${ (grid['vertically-distributed'] ? 'vertically-distributed="' + grid['vertically-distributed'] + '"' : '')}
              ${ (grid['order'] ? 'order="' + grid['order'] + '"' : '')}
            >
              ${Array.apply(null, {length:grid.boxes}).reduce((boxes, box) => 
                `${boxes}<div class="demo_box"></div>`
              , '')}
            </section></article>`
  }
}

document.registerElement('ragrid-demo', RagridDemo)