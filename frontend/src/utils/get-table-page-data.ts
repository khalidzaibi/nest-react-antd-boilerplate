// import type { PageData } from '@/interface';

export const getTableData = <T extends any[]>(pageNum = 1, pageSize = 10, totalData: T) => {
  const total: number = totalData.length;
  const tableData: any = {
    data: [],
    pageNum,
    pageSize,
    total,
  };

  if (pageSize >= total) {
    //pageSize
    tableData.data = totalData;
    tableData.pageNum = 1;
  } else {
    //pageSize
    const num = pageSize * (pageNum - 1);

    if (num < total) {
      const startIndex = num;
      const endIndex = num + pageSize - 1;

      tableData.data = totalData.filter((_, index) => index >= startIndex && index <= endIndex);
    } else {
      const size = Math.ceil(total / pageSize);
      const rest = total % pageSize;

      if (rest > 0) {
        tableData.pageNum = size + 1; //size+1
        tableData.data = totalData.filter((_, index) => index >= pageSize * size && index <= total);
      } else if (rest === 0) {
        //pageSize
        tableData.pageNum = size; //size
        tableData.data = totalData.filter((_, index) => index >= pageSize * (size - 1) && index <= total);
      }
    }
  }

  return tableData;
};
