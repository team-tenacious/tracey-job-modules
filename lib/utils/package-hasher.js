module.exports = PackageHasher;

function PackageHasher() {
}

PackageHasher.prototype.createPackageHash = function (pkg) {

    var self = this;

    var hashObj = {
        devDependencies: self.__sortObject(pkg.devDependencies),
        dependencies: self.__sortObject(pkg.dependencies)
    };

    return self.__createHash(JSON.stringify(hashObj));
};

PackageHasher.prototype.__createHash = function (stringToHash) {

    var hash = 0;

    if (stringToHash.length == 0)
        return hash;

    for (var i = 0; i < stringToHash.length; i++) {
        var char = stringToHash.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash);
};

PackageHasher.prototype.__sortObject = function (object) {

    var self = this;

    var sortedObj = {},
        keys = Object.keys(object);

    keys.sort(function (key1, key2) {
        key1 = key1.toLowerCase();
        key2 = key2.toLowerCase();
        if (key1 < key2) return -1;
        if (key1 > key2) return 1;
        return 0;
    });

    for (var index in keys) {
        var key = keys[index];
        if (typeof object[key] == 'object' && !(object[key] instanceof Array)) {
            sortedObj[key] = self.__sortObject(object[key]);
        } else {
            sortedObj[key] = object[key];
        }
    }

    return sortedObj;
};