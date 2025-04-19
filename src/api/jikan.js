export const fetchupcominganimedata = async() => {
    
    const res = await fetch('https://api.jikan.moe/v4/seasons/upcoming');
    const data = await res.json();
    return data.data
}