export const getEmbedURL = (url) => {
    const expressions = [
        {
            exp: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
            width: 400,
            embedURL:{
                firstPart: `https://youtube.com/embed/`,
                lastPart: ``
            },
            length: 11,
            type: 'youtube' 
        },
        {
            exp: /^.*(twitter.com.*\/*\/status\/)([[0-9]{19}]*).*/,
            width: 400,
            embedURL:{
                firstPart: `https://platform.twitter.com/embed/Tweet.html?dnt=false&embedId=twitter-widget-0&features=e30%3D&frame=false&hideCard=false&hideThread=false&id=`,
                lastPart: `&lang=en&origin=data%3Atext%2Fhtml%3Bcharset%3Dutf-8%2C%253Cblockquote%2520class%253D%2522twitter-tweet%2522%253E%253Cp%2520lang%253D%2522cs%2522%2520dir%253D%2522ltr%2522%253E1%2Fx%2520Nad%25u0161en%25ED%2520nad%2520za%25u0159azen%25EDm%2520j%25E1dra%2520a%2520plynu%2520do%2520EU%2520taxonomie%2520ukazuje%252C%2520%25u017Ee%2520nikdo%2520z%2520politik%25u016F%2520a%2520jen%2520m%25E1lo%2520lid%25ED%2520ve%2520ve%25u0159ejn%25E9%2520debat%25u011B%2520ch%25E1pe%252C%2520o%2520co%2520jde.%2520M%25EDsto%2520%25u201Ev%25EDt%25u011Bzstv%25ED%2520pro%2520%25u010Cesko%25u201C%2520by%2520se%2520m%25u011Blo%2520oz%25FDvat%252C%2520%25u017Ee%2520jde%2520o%2520%25u201Eho%25u0159k%25E9%2520v%25EDt%25u011Bzstv%25ED%2520s%2520nerealizovateln%25FDmi%2520podm%25EDnkami%25u201C.%2520A%2520%25u017Ee%2520jde%2520v%25EDce%2520o%2520plyn%2520ne%25u017E%2520j%25E1dro.%253C%2Fp%253E%2526mdash%253B%2520David%2520Klime%25u0161%2520%2528%40david_klimes%2529%2520%253Ca%2520href%253D%2522https%253A%2F%2Ftwitter.com%2Fdavid_klimes%2Fstatus%2F1477615898294996994%253Fref_src%253Dtwsrc%25255Etfw%2522%253EJanuary%25202%252C%25202022%253C%2Fa%253E%253C%2Fblockquote%253E%250A%253Cscript%2520async%2520src%253D%2522https%253A%2F%2Fplatform.twitter.com%2Fwidgets.js%2522%2520charset%253D%2522utf-8%2522%253E%253C%2Fscript%253E%250A%253Cstyle%253Ehtml%257Boverflow%253Ahidden%2520%2521important%253B%257D%253C%2Fstyle%253E&theme=light&widgetsVersion=9fd78d5%3A1638479056965&width=550px`
            },
            length: 19,
            type: 'twitter' 
        },
        {
            exp: /^.*(instagram.com.*\/*\/p\/)([\w]{11}]*).*/,
            width: 400,
            embedURL:{
                firstPart: `https://www.instagram.com/p/`,
                lastPart: `/embed`
            },
            length: 11,
            type: 'instagram' 
        },
        {
            exp: /^.*(facebook.com.*\/*\/posts\/)((\d+)$]*).*/,
            width: 400,
            embedURL:{
                firstPart: `https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fnayadiganta%2Fposts%2F`,
                lastPart: `&show_text=true&width=500`
            },
            length: 17,
            type: 'facebook' 
        }
    ]

    try {
        const regFilterInfo = expressions.filter(expressionInfo => url.match(expressionInfo.exp));

        if(regFilterInfo){
            const match  = url.match(regFilterInfo[0].exp)
            return (match && match[2].length <= regFilterInfo[0].length)
            ? `${regFilterInfo[0].embedURL.firstPart}${match[2]}${regFilterInfo[0].embedURL.lastPart}`
            : null;
        }   
    } catch (error) {
        return null
    }
}