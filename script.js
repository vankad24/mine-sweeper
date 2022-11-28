const n = 12 //game field size
const n_bombs = 10
const field_width = .7
const colors = ["#0000ff","#007b00","#ff0000","#00007b","#7b0000","#007b7b", "#000000", "#7b7b7b" ]
let all_elements
let game_field = []
let opened = 0
let first_click = true

function createField(){
	const html = document.body.parentElement
	const cell_size = Math.min(html.clientWidth,html.clientHeight)*field_width/n
	const font_size = cell_size*.7
	field = document.createElement("div")
	field.classList.add("field")
	field.style.gridTemplateColumns = `repeat(${n}, 1fr)`
	field.style.fontSize = `${font_size}px`
	document.body.appendChild(field)
	field.addEventListener("click", left_click)
	field.addEventListener("contextmenu", right_click)
	
	for(let i=0; i < n*n; i++){
		d = document.createElement("div")
		d.style.width = `${cell_size}px`
		d.style.height = `${cell_size}px`
		d.classList.add("opened_cell")
		field.appendChild(d)
	}
	
	all_elements = Array.from(field.children)
}

function left_click(e){
	const el = e.target
	if (el.classList.contains("closed_cell") && el.innerText.length ===0){
		playSound("open")
		const index = all_elements.indexOf(el)
		let v = game_field[index]
		if (first_click){
			first_click = false
			while(v>=10){
				generateField()
				v = game_field[index]
			}
		}
		if(v===0)open_area(index)
		else open_cell(el, v)
		if (v>=10)lose()
		if (opened+n_bombs===n*n)win()
	}
}

function open_cell(el, v){
	// playSound("open")
	el.classList.remove("closed_cell")
	el.classList.add("opened_cell")
	opened++
	if (v>=10){
		el.innerText = "💣"
	}else if(v===0){
		el.innerText = ""
	}else{
		el.style.color = colors[v-1]
		el.innerText = v
	}
}

function right_click(e){
	e.preventDefault()
	const el = e.target
	if (el.classList.contains("closed_cell")){
		if (el.innerText.length !==0)el.innerText = ""
		else {
			playSound("flag")
			el.innerText = "⚑"
			el.style.color = "#000"
		}
	}
}

function generateField(){
	game_field = []
	for (let i=0;i<n*n;i++)game_field.push(0)
	opened = 0
	let k = 0
	while(k<n_bombs){
		const i = Math.floor(Math.random() * game_field.length)
		if (game_field[i]<10){
			for (let minus=-1;minus<2;minus++){
				for (let j=-1;j<2;j++){
					const row = i%n+j
					if (row>=0 && row < n)game_field[i+n*minus+j]++
				}
			}
			game_field[i]=10
			k++
		}
	}
}

function clear_field(){
	for (let el of all_elements){
		el.classList.add("closed_cell")
		el.classList.remove("opened_cell")
		el.innerText = ""
	}
}

function open_area(index){
	const el = all_elements[index]
	if (el.classList.contains("closed_cell")){
		const v = game_field[index]
		if (v<10)open_cell(el,v)
		if (v===0){
			const right = index%n<n-1
			const left = index%n>0
			const top = index>=n
			const bottom = index<n*n-n
			if (right)open_area(index+1)
			if (left)open_area(index-1)
			if (top){
				open_area(index-n)
				if (left)open_area(index-n-1)
				if (right)open_area(index-n+1)
			}
			if (bottom){
				open_area(index+n)
				if (left)open_area(index+n-1)
				if (right)open_area(index+n+1)
			}
		}
	}
}

function open_all(){
	for (let i=0;i<n*n;i++)open_cell(all_elements[i],game_field[i])
}

function playSound(name) {
	const audio = new Audio(`./audio/${name}.mp3`);
	audio.play()
}

function win(){
	playSound("win")
	open_all()
	setTimeout(()=>{
		alert("Вы выиграли!")
	},500)	
}

function lose(){
	playSound("lose")
	open_all()
	setTimeout(()=>{
		alert("Вы проиграли!")
	},500)
}

function createButton(){
	b = document.createElement("button")
	b.classList.add("button_start")
	b.innerText = "Начать"
	document.body.appendChild(b)
	b.addEventListener("click",e=>{
		playSound("start")
		first_click = true
		generateField()
		clear_field()
	})
}

function start(){
	createButton()
	createField()
	// open_all()
}

document.addEventListener("DOMContentLoaded",start)