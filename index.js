class VirtualList extends HTMLDivElement {
    #listeners = []
    #render = { from: null, to: null }
    #selected = null
    #boundaryItems = 1
    #visibleItems = -1
    #listHeight = 0
    #itemHeight = 22
    #items = []
    #itemTemplate = (index, data) => {
        const classAttr = index === this.selected ? 'selected' : ''
        return `<li data-index="${index}" class="${classAttr}" style="top:${
            index * this.itemHeight
        }px; height:${this.itemHeight}px;">${this.#template(data)}</li>`
    }
    #template = (data) => data

    get template() {
        return this.#template
    }

    set template(value) {
        if (typeof value !== 'function')
            throw Error('template must be a function')
        this.#template = value
    }

    get render() {
        return this.#render
    }

    set render({ from, to }) {
        this.#render = { from, to }
        var html = []
        for (var i = from, j = to; i <= j; i++)
            html.push(this.itemTemplate(i, this.items[i]))
        html = html.join('')
        this.list.innerHTML = html
    }

    get selected() {
        return this.#selected
    }

    set selected(value) {
        if (
            Number.isInteger(value) &&
            value >= 0 &&
            value < this.#items.length
        ) {
            this.#selected = value
            this.calcItemsToRender()
        } else {
            this.#selected = null
        }
        if (this.#selected !== null) {
            this.dispatchEvent(new Event('input'))
        }
    }

    get itemTemplate() {
        return this.#itemTemplate
    }

    set itemTemplate(value) {
        this.#itemTemplate = value
        this.calcItemsToRender()
    }

    get listHeight() {
        return this.#listHeight
    }

    set listHeight(value) {
        this.#listHeight = value
        this.list.style.height = `${this.#listHeight}px`
    }

    get itemHeight() {
        return this.#itemHeight
    }

    set itemHeight(value) {
        this.#itemHeight = value
        this.listHeight = this.#items.length * this.#itemHeight
    }

    get items() {
        return this.#items
    }

    set items(value) {
        this.#selected = null
        this.#items = value
        this.listHeight = this.#items.length * this.#itemHeight
        this.setVisibleItems()
        this.calcItemsToRender()
    }

    constructor() {
        super()

        this.list = document.createElement('ul')
        this.appendChild(this.list)

        // some important styles
        this.tabIndex = 0
        this.style.display = 'block'
        this.style.overflowX = 'hidden'
        this.style.overflowY = 'auto'
        this.list.style.position = 'relative'

        // Start component
        this.setVisibleItems()
        this.calcItemsToRender()
    }

    connectedCallback() {
        // Bind listeners
        this.listen(this, 'keydown', this.onKeydown.bind(this))
        this.listen(this, 'scroll', this.onScroll.bind(this))
        this.listen(this.list, 'click', this.onClick.bind(this))
        this.listen(window, 'resize', this.onResize.bind(this))
        this.dispatchEvent(new Event('connected'))
    }

    disconnectedCallback() {
        // Unbind listeners
        for (const { element, event, callback } of this.#listeners)
            element.removeEventListener(event, callback)
        this.dispatchEvent(new Event('disconnected'))
    }

    listen(element, event, callback) {
        element.addEventListener(event, callback)
        this.#listeners.push({ element, event, callback })
    }

    setVisibleItems() {
        this.#visibleItems = Math.ceil(this.clientHeight / this.itemHeight)
    }

    calcItemsToRender() {
        if (!this.#visibleItems) return true

        var from = Math.floor(this.scrollTop / this.itemHeight),
            to = from + this.#visibleItems

        from = from - this.#boundaryItems
        if (from < 0) from = 0

        to = to + this.#boundaryItems
        if (to > this.items.length - 1) to = this.items.length - 1

        this.render = { from, to }
    }

    visibleSelected(alignToTop) {
        const el = this.list.querySelector('.selected')
        if (el) {
            const { bottom, top } = el.getBoundingClientRect()
            const parent = this.getBoundingClientRect()
            const isVisible =
                Math.ceil(top) >= Math.floor(parent.top) &&
                Math.floor(bottom) <= Math.ceil(parent.bottom)
            if (!isVisible) {
                el.scrollIntoView(!!alignToTop)
            }
        } else {
            const top = this.#selected * this.itemHeight
            this.scrollTo({ top })
        }
    }

    onScroll() {
        this.calcItemsToRender()
    }

    onResize() {
        this.setVisibleItems()
        this.calcItemsToRender()
    }

    onClick(e) {
        const target = e.target.closest('li')
        if (target) {
            this.selected = parseInt(target.dataset.index, 10)
        }
    }

    onKeydown(e) {
        switch (e.key) {
            case 'ArrowUp':
                if (this.#selected > 0) {
                    e.preventDefault()
                    this.selected--
                    this.visibleSelected(true)
                }
                break
            case 'ArrowDown':
                if (this.#selected === null && this.#items.length) {
                    e.preventDefault()
                    this.selected = 0
                    this.visibleSelected()
                } else if (this.#selected < this.#items.length - 1) {
                    e.preventDefault()
                    this.selected++
                    this.visibleSelected()
                }
                break
        }
    }
}

customElements.define('virtual-list', VirtualList, { extends: 'div' })
