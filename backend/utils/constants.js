exports.JWT_EXPIRATION_PERIOD = "1h";
exports.JWT_REFRESH_EXPIRATION_PERIOD = "7d";
exports.COOKIE_EXPIRATION_TIME = 7 * 24 * 60 * 60* 1000;
exports.SALT_ROUND = 10;
exports.EMAIL_REGEX = /^[\w-_\.+]*[\w-_\.]\@([\w]+\.)+[\w]+[\w]$/;
exports.USERNAME_REGEX = /^[a-z0-9_]{2,30}$/;
exports.PROFILE_PIC_STORAGE_PATH="uploads/ProfilePicture/"