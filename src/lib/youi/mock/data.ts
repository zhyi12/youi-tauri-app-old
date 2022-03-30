
let dataList = {};

export const mockDataManager = {

    init() {
        dataList = {};
    },

    get(name){
        return dataList[name];
    },

    /**
     *
     * @param name
     * @param data
     */
    register(name,data){
        dataList[name] = data;
    }

};