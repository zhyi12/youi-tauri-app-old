/**
 * 日程
 */
export interface Schedule {
    /**
     *
     */
    id:string,
    /**
     * 日程名称
     */
    text:string,
    /**
     * 开始时间
     */
    start_time:number,
    /**
     * 结束时间
     */
    end_time:number,
    /**
     * 日程详情
     */
    description:string,
    /**
     * 是否全天
     */
    all_day:boolean,
    /**
     * 显示颜色
     */
    color:string,
}