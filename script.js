let n = 12 //game field size
let n_bombs = 10
const field_width = .75
const colors = ["#0000ff","#007b00","#ff0000","#00007b","#7b0000","#007b7b", "#000000", "#7b7b7b" ]
let all_elements = []
let game_field = []
let opened = 0
let first_click = true

function createField(){
	const html = document.documentElement
	const cell_size = Math.min(html.clientWidth,html.clientHeight)*field_width/n
	const font_size = cell_size*.7
	field = document.querySelector(".field")
	field.replaceChildren()
	field.style.setProperty("--columns",n)
	field.style.setProperty("--cell-size",cell_size+"px")
	field.style.setProperty("--font-size",font_size+"px")
	field.addEventListener("click", left_click)
	field.addEventListener("contextmenu", right_click)
	
	for(let i=0; i < n*n; i++){
		d = document.createElement("div")
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
			while(v!=0){
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
		el.classList=""
		el.classList.add("closed_cell")
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
	// setTimeout(()=>{
		// alert("Вы выиграли!")
	// },500)
}

function shuffle(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]]
	}
}

function lose(){
	let bombs = []
	for (let i=0;i<game_field.length;i++){
		if (game_field[i]>9)bombs.push(all_elements[i])
	}
	shuffle(bombs)
	for (let i=0;i<bombs.length;i++){
		setTimeout(()=>{
			if (i===bombs.length-1)open_all()
			if (i%3==0)playSound("lose")
			open_cell(bombs[i],10)
			bombs[i].classList.add("bomb")
			setTimeout(()=>{
				bombs[i].classList.remove("bomb")
			},1500)
		}, Math.sqrt(i)*220)
	}
}

function onSliderChange(e){
	slider = e.target
	const v = slider.value
	const out = slider.nextElementSibling
	out.textContent = v
}

function onFieldChange(e){
	onSliderChange(e)
	n = +e.target.value
	createField()
}
function onBombsChange(e){
	onSliderChange(e)
	n_bombs = +e.target.value
	createField()
}


function start(){
	document.querySelector(".button_start").addEventListener("click",e=>{
		playSound("start")
		first_click = true
		generateField()
		clear_field()
	})
	createField()
	const arr = document.querySelectorAll(".slider>input")
	arr[0].addEventListener("input",onFieldChange)
	arr[1].addEventListener("input",onBombsChange)
	for (let el of arr)onSliderChange({"target":el})
	// open_all()
}

document.addEventListener("DOMContentLoaded",start)