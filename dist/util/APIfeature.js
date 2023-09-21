"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.page = exports.sort = void 0;
const sort = (queryString, query) => __awaiter(void 0, void 0, void 0, function* () {
    if (queryString.sort) {
        const sortBy = queryString.sort.split(',').join(' ');
        return query.sort(sortBy);
    }
    else {
        return query.sort('-createdAt');
    }
});
exports.sort = sort;
const page = (queryString, query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = queryString.page * 1 || 1;
    const limit = queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
});
exports.page = page;
//# sourceMappingURL=APIfeature.js.map