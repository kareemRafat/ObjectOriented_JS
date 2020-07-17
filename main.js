	let log = console.log;
	
	let form = document.getElementById('myForm');

	let submit = document.querySelector('input[type="submit"]');

	let tableBody = document.querySelector('tbody');

	let inputs = Array.from(form.children);

	let poped = inputs.pop();

//###################################

	class Employee {

		constructor(id,name,email,address)
		{
			this.id = id ;
			this.name =  name ;
			this.email =  email ;
			this.address = address;

			this.myArr = [this.id , this.name , this.email , this.address];
		}

		 validateInput(){
			if(localStorage.getItem('employee')){
				var validate = JSON.parse(localStorage.getItem('employee')).filter(item => item.name === this.name).map(item => item.name);
				if(validate.includes(this.name)){
					return false ;
				}else{
					return true ;
				}
				// log(validate)
			}			
		}

		checkInput()
		{

			  const check = this.myArr.every(item => item !== '')
			  return check;
		}

		insertHtml(id,name,email,address)
		{

			let trEl = document.createElement('tr');
			trEl.innerHTML = `
				<tr>
					<td>${id}</td>
					<td>${name}</td>
					<td>${email}</td>
					<td>${address}</td>
					<td>
						<a href="" id="edit" class="btn btn-info edit" data-class="${id}">edit</a>
						<a href="" id="delete" class="btn btn-danger delete" data-class="${id}">Delete</a>
					</td>
				</tr>        `;

			tableBody.appendChild(trEl)
			
		}

		showData() // to show newly inserted data only with html(tr) not loclStrg
		{

			if(this.checkInput() == true){
				this.insertHtml(...this.myArr);
			}
			return this ; // for method chaining

		}


		storeNLocal()
		{
			//we parse the json string beacues it came stringfied
			const data = JSON.parse(localStorage.getItem('employee')) ?? [];
			if(this.checkInput() == true ){
				data.push({
					id : this.id,
					name : this.name,
					email : this.email,
					address : this.address
				})

				localStorage.setItem('employee',JSON.stringify(data));

				//remove the td -> No Data saved
				let del = tableBody.querySelector('td[colspan="3"]') ?? '';
				if(del !== '') del.remove();

				this.inserted = true; // to reset the form if setItem is complete
			}

		}

	    getStorageData() // to show the localStorageData in html
	    {
			
			if(localStorage.getItem('employee')){

				JSON.parse(localStorage.getItem('employee')).forEach(function(item){
					// evrey elemnt will insert in tr
					 this.insertHtml(item.id,item.name,item.email,item.address);
				},this) // this is thisArg second parameter to forEach function

			} else {
				const emptyLi = document.createElement('td');
				emptyLi.setAttribute('colspan','3')
				emptyLi.innerHTML = 'No Data saved'
				tableBody.appendChild(emptyLi)
			}
		}


		updateEmployee(...items)
		{
			let myItem = {id:+items[0],name:items[1],email:items[2],address:items[3]};
			let myUpdatedData = JSON.parse(localStorage.getItem('employee')).map(item => {
			
				if(item.id == items[0]){
					return myItem;
				}

				return item;
			})

			localStorage.setItem('employee',JSON.stringify(myUpdatedData));

			this.updated = true; // to reset the form
		}

		static getLastId()
		{
			if(localStorage.getItem('employee')){
				var lastId = JSON.parse(localStorage.getItem('employee')).map(item => item.id);
				let id =  lastId[lastId.length - 1 ] + 1;
				return id;
			}else{
				let id = 1 ;
				return id ;
			}
		}

		static checkStoredData()
		{
			const storedData = JSON.parse(localStorage.getItem('employee'));
			if(storedData.length === 0) localStorage.removeItem("employee");
		}

	}

//###################################

	var classEmp = new Employee();
	classEmp.getStorageData(); // to show the localStorage data when page load

//###################################

	const formSubmit = function(event){
		event.preventDefault();
		// first iteration in map will loop in div.formControl
		// second iteration in map will loop in input the lastElChild of div.formControl
		var items = inputs.map(item => item.lastElementChild).map(item => item.value);

		if(!submit.id){
			// generate non repeated id
			var id = Employee.getLastId();
			items.unshift(id++); // add the id to items array in first position
			
			var classEmp = new Employee(...items);
			classEmp.showData().storeNLocal();

			

		}else{
			
			var id = submit.getAttribute('data-id');
			items.unshift(id);
			var classEmp = new Employee(...items);
			classEmp.updateEmployee(...items);
			submit.value ='Submit';
			submit.removeAttribute('id')
			tableBody.innerHTML = '';
			classEmp.getStorageData();

		}

		//reset form if insertion and update ops in localStorage done
		setTimeout(function(){
			if(classEmp.inserted || classEmp.updated) form.reset();
		},500);
	}

	const vaildateForm = function(event){
		event.preventDefault();
		if(!submit.id){
			var myItems = inputs.map(item => item.lastElementChild);
			myItems.forEach(item => {
				if(item.value == ''){
					item.style.border = 'solid red 2px';
					let mk1stLtrUprCase = item.name.charAt(0).toUpperCase() + item.name.slice(1);
					item.placeholder = `${mk1stLtrUprCase} is required`;
				} else {
					setTimeout(function(){
						item.style.border = 'solid grey 1px';
						item.placeholder = '';

					},500);
				}
			})
		}			

	}



	form.addEventListener('submit',vaildateForm);
	form.addEventListener('submit',formSubmit);

//###################################


	tableBody.addEventListener('click',function(event){
		event.preventDefault();
		if(event.target.classList.contains('delete')){
			event.target.closest('tr').remove();
			let delId = +event.target.getAttribute('data-class');
			let myData = JSON.parse(localStorage.getItem('employee'));
			// get all elements except the id i want to delete ->
			let filtered = myData.filter(item => item.id !== delId);
			localStorage.setItem('employee',JSON.stringify(filtered));

			Employee.checkStoredData(); // remove the localStorage when lastElement deleted

		}

		if(event.target.classList.contains('edit')){
			let editId = +event.target.getAttribute('data-class');
			let myDatas = JSON.parse(localStorage.getItem('employee'));
			let editedData = myDatas.find(item => item.id === editId);

			var items = inputs.map(item => item.lastElementChild).map(item => item);
			items[0].value = editedData.name;
			items[1].value = editedData.email;
			items[2].value = editedData.address;

			inputs.map(item => item.lastElementChild).forEach(item => {
				item.style.border = 'solid grey 1px';
				item.placeholder = '';
			})

			submit.id = 'countId';
			submit.setAttribute('data-id',editId);
			submit.value = 'Edit';

			
		}
	})

//###################################
