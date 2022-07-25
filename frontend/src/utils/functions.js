const noImageCache = (image_url) => {
    if(!image_url) return image_url;

    image_url += image_url.includes('?') ? '&': '?';
    image_url += "a=" + new Date().getTime();
    return image_url;
}

module.exports = { noImageCache };