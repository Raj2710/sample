let data = [
    "Nagarajan",
    "Manish",
    "Imran Akthar",
    "Arun",
    "Khaleel Rahman",
    "Bala",
    "Michale",
    "Mohideen",
    "Taufiq",
    "Gokul",
    "Kanish",
    "Balaji"
]
let pageView = 5;
let currentPage = 1;

                            //3     //1===> 0 1 2, 3,4,5    6,7,8  9,10,11
function createPagination(pageView,currentPage)
{
    let d = document.getElementById("d1")
    d.textContent = ""

    let start = (pageView*currentPage)-pageView
    let end = pageView*currentPage

    start = start>=data.length?0:start
    end = end>=data.length?data.length:end

    for(let i=start;i<end;i++)
    {
        d.append(data[i])
        let br = document.createElement("br")
        d.append(br)
    }
}
createPagination(pageView,currentPage)


function changePrev(){
    currentPage!=1?currentPage--:""
    createPagination(pageView,currentPage)
}
function changeNext(){
    let value = Math.ceil(data.length/pageView)
    currentPage<value?currentPage++:""
    createPagination(pageView,currentPage)
}


function myFunction(){
    let input = document.getElementById("inputbox")
    let message = document.getElementById("p1")
    try{
        if(input.value == "") throw "Age Field Can not be empty"
        if(isNaN(input.value)) throw "Age Should be a number"
        let x = Number(input.value)
        if(x<18) throw "Only Adults Allowed"
        else    throw "Input Age is "+x
    }
    catch(error)
    {
        message.innerHTML = error
    }
    finally
    {
        input.value = ""
    }
}

