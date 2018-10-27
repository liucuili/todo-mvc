(function (window,Vue,undefined) {
	//window为什么要传进去？
	//因为在查找作用域的时候可以省一级的作用域，而且可以看到依赖了什么
	//传undefined，是因为如果使用了undefined就一定可以拿到undefined的值，有形参不一定有实参，那肯定能够拿到undefined
	//2当数组再次发生改变就在粗存储回localStorage里面
	//2-1只要数组改变，就触发存储行为
	//2-2用watch深度监听
	//3.自定义一个指令
	// 3-1:自动获取焦点
	/*4添加一条数据
		4.1想数组末尾添加一个对象
		4.2出现一个这样的对象
		4.3 content:input输入的内容
		4.4 isFinish:false;默认为false状态，因为刚添加的还是未完成的
		4.5 id: 如果数组是乱序的，需要排序，按照id的大小排序，拿最后一个的id+1
	*/
	/*5.删除一条数据（todo）
		5.1应该是使用id去删除，但是渲染是根据索引来渲染的
		5.2所以视图和数据是配套的，视图渲染出来的第一条，索引是0，id是1，第二条，1-->2
		5.3因为是配套，所以可以根据索引来删除
	*/
	/*6. 监听为true的数据，由于数据A,来源于数据B,所以要用computed计算属性
		计算所有isFinish为false的个数
	*/
	/*7.让全部删除按钮显示与隐藏
		7.1 如果activeNum=== dataList.length,说明应该隐藏，如果不一致，就应该显示
	*/
	/*8.全部删除，删除的是所有isFinish为true的元素,需要遍历
		8.1剩余的是isFinish为false的所有项
		8.2把所有isFinish为false的筛选出来，剩余的就是true,相当于就是把所有为true的删除
	*/
	/*9.全选与反选，按钮的显示与隐藏
		9.1使用计算属性配合every方法计算出一个值，true 或者 false
		9.2使用v-modle 绑定到全选按钮上
		9.3当点击全选按钮的时候，触发改变的行为，让数组中每一个isFinish的属性等于我的改变后的值
		9.4导致计算属性的被计算项改变而重新计算，得到一个新的值
	*/
	/*10修改，双击出现框
		10.1 双击的时候，让所有的li删除类名，当前的li增加类名，捕获所有的li
		ref类似于class
		$refs 不管是点击哪个位置执行，都能得到页面中所有有ref属性的元素
		10.2编辑的时候，判断跟之前有没有变化，如果跟之前的有变化，
			使用$refs获取所有的li,让每一个li移入editing,当前点击元素添加类名
		10.3在编辑之前拷贝了一份内容，来判断编辑前后的变化
	*/
	/*11.正真编辑的时候updateTodo
		11.1回车事件
			判断是否为空，需要传递Index，如果为空，根据Index去删除当前项
		11.2判断当前和备份那份内容是否有所改变，改变了就把isFinish变成false
		11.3让当前这个lis把editing移出
		11.4清空beforeUpdate
	*/
	/*12.按esc还原内容
	*/
	/*13.改变类名
		13.1 依赖于一个data中的属性，到底是 1 还是2 还是3
		13.2 通过hashchange这个事件来决定data中的属性 
		13.3 一个hashchange事件在onhashchange事件中执行
		13.4 在全局created里面执行，
		13.5 created 是个钩子函数，它就是创建了数据以后，还没开始渲染之前
	*/ 
	/*14. 根据hash的改变现实不一样的内容
		14.1 显示所有
		14.2 显示未完成 isFinish == false      不打√
		14.3 显示已经完成的 isFinish == true   前面打√
	
	*/ 
	/*
		假设数组有5项，all[true,true,true,true]  每一项都为true,显示所有
		给每个li一个v-show
		active[true,false,false,false] 给v-show使用  取反就是active
	*/ 
	new Vue({
		el:'#app',
		data:{
			//将假数据删掉，用localStorage里面存储的 
			//因为拿出来的是字符串，所以需要用JSON.parse去转变成对象
			dataList: JSON.parse(window.localStorage.getItem('dataList'))|| [] ,
			newTodo:'',
			// 用beforeUpdate保存编辑之前的信息，为了跟编辑后作对比
			beforeUpdate: {},
			activeBtn: 1,
			showArr:[]
		},
		methods:{
			//添加一个todo
			addToto() {
				//组装一个对象，把对象添加到数组里,先判断是否为空
				if(!this.newTodo.trim()) {
					return
				}	

				this.dataList.push({
					//先排列(由小到大)，再将最后一项（最小）取出来，最后一项是length-1项,要取的是最小的那项的id+1
					//是对之前的进行排序取出之前最后一项的id,新创建的对象的id是在原来的基础上+1
					//但是在添加之前要看是否有对象，如果有就是排序后+1，如果没有，说明是第一项，id就为1
					id: this.dataList.length ? this.dataList.sort((a, b) => a.id - b.id)[this.dataList.length - 1]['id'] + 1 : 1,
					content:this.newTodo.trim(),
					isFinish:false
				}),
				this.newTodo=''
			},
			deleTodo(index){
				//删除一个
				this.dataList.splice(index, 1)
				console.log(index)
			},
			//删除所有
			deleAll() {
				this.dataList = this.dataList.filter(item => !item.isFinish)//拿回所有等于false的
			},
			//显示编辑文本框，排它,要传参，确定点击的是哪一个
			showEdit(index) {
				this.$refs.show.forEach(item=>{
					//排它，每一项都取消Editing类名
					item.classList.remove('editing')
				})
				//当前的加上类名
				this.$refs.show[index].classList.add('editing')
				//深拷贝，而且这个对象中没有函数，只有数据，这样来回转换就成了两个不同的对象了
				this.beforeUpdate = JSON.parse(JSON.stringify(this.dataList[index]))
			},
			//真正的按enter事件来编辑，要先判断是不是空的
			updateTodo(index) {
				//判断如果按回车之前是空的，就直接删除
				if(!this.dataList[index].content.trim()) return this.dataList.splice(index,1)
				//双击后，对比两次内容一致不，如果不一致，需要将isFinish的布尔值设置成false
				if(this.dataList[index].content !== this.beforeUpdate.content) {
					this.dataList[index].isFinish = false
				}
				//删除类名editing
				this.$refs.show[index].classList.remove('editing')
				this.beforeUpdate = {}
			},
			//按esc键还原
			backTodo(index){
				this.dataList[index].content = this.beforeUpdate.content
				this.$refs.show[index].classList.remove('editing')
				this.beforeUpdate = {}
			},
			//注册hash事件，改变类名
			hashchange() {
				switch(window.location.hash) {
					case'':
					case '#/':
						this.showAll()
						this.activeBtn = 1
						break
					case'#/active':
						this.activeAll(false)
						this.activeBtn = 2
						break
					case '#/completed':
						this.activeAll(true)
						this.activeBtn = 3
						break
				}
			},
			//创建一个显示的数组
			showAll() {
				this.showArr = this.dataList.map(() =>  true)
			},
			//修改显示的数组使用,显示所有活动着的
			// activeAll(boo) {
			// 	this.showArr = this.dataList.map((item) =>  item.isFinish===boo)
				
			// },

			activeAll (boo) {
				this.showArr = this.dataList.map(item => item.isFinish === boo)
				// 判断是不是有 true
				// 数组里面每一项应该都是 false
				if (this.dataList.every(item => item.isFinish === !boo)) return window.location.hash = '#/'
			}

		},
		computed: {
			//因为每次dataList改变都会重新计算
			activeNum() {
				//拿原始数组中所有为false的数据，filter是过滤了所有isFinish为false的元素
				//false==》指没打√，strong里记录的是为false的个数，就是没打√的个数
				return this.dataList.filter(item => !item.isFinish).length
				// console.log(this.dataList.filter((item) => {
				// 	if(item.isFinish === false) {
				// 		return item
				// 	}
				// }).length)
				
			},
			toggleAll : {
				get() {
					//判断每一个是不是都说true，如果每一个都是true, return true,
					//遍历每一个是不是都是true,every
					return  this.dataList.every(item => item.isFinish)
						 
					
				},
				// 设置计算属性，这个设置智能捕获到一个要改变的行为
				//只能在我想改变的这个行为里面去触发被计算项，让当前这个值重新计算，
				// 只要被计算项一改，就会重新计算，就能得到一个新的值，
				set(val) {
					//已经触发了想要改变的行为，让dataList中的每一项都发生变化
					this.dataList.forEach(item => item.isFinish = val
						
					)
					console.log(val)
				}
			}
		},
		watch: {
			dataList:{
				handler(newArr) {
					window.localStorage.setItem('dataList', JSON.stringify(newArr))
					//数组改变应该判断如果当前是completed，
					// 应该判断有没有为true的，如果没有，切换到#/;
					this.hashchange() 
				},
				//深度监听
				deep: true
			}
		},
		//自动聚焦
		directives: {
			focus:{
				inserted(el) {
					el.focus()
				}
			}
		},
		//生命周期，created，当所有data中的属性生效时，就执行
		created() {
			//捕获当前的hash值
			this.hashchange()
			window.onhashchange = () => {
				this.hashchange()
			}
		}
	})
})(window,Vue,undefined);
