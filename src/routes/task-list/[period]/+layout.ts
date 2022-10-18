import type { LayoutLoad ,LayoutLoadEvent} from './$types';
import dayjs from "dayjs";

export const load: LayoutLoad = async ({params}:LayoutLoadEvent) => {
    const time = dayjs();
    return {

        year:time.year(),
        month:time.month(),
        date:time.date(),
        period:params.period
    }
}