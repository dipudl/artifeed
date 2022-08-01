const noImageCache = (image_url) => {
    if(!image_url) return image_url;

    image_url += image_url.includes('?') ? '&': '?';
    image_url += "a=" + new Date().getTime();
    return image_url;
}

function formatDate(isoDate) {
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    let fDate = new Date(isoDate);
    const date = `${month[fDate.getMonth()]} ${fDate.getDate()}, ${fDate.getFullYear()}`;
    return date;
}

module.exports = { noImageCache, formatDate };