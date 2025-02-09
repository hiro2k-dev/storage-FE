/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// Chakra imports
import { Box, SimpleGrid } from '@chakra-ui/react';
// import DevelopmentTable from "views/admin/dataTables/components/DevelopmentTable";
// import CheckTable from "views/admin/dataTables/components/CheckTable";
import FileTable from 'views/admin/dataTables/components/FileTable';
// import ColumnsTable from "views/admin/dataTables/components/ColumnsTable";
// import ComplexTable from "views/admin/dataTables/components/ComplexTable";
import {
  // columnsDataDevelopment,
  columnsFileData,
  // columnsDataColumns,
  // columnsDataComplex,
} from 'views/admin/dataTables/variables/columnsData';
// import tableDataDevelopment from "views/admin/dataTables/variables/tableDataDevelopment.json";
import tableDataCheck from 'views/admin/dataTables/variables/tableDataCheck.json';
// import tableDataColumns from "views/admin/dataTables/variables/tableDataColumns.json";
// import tableDataComplex from "views/admin/dataTables/variables/tableDataComplex.json";
import React, { useEffect, useState } from 'react';
import api from 'api/axios';
import { useQuery } from 'react-query';
export default function Settings() {
  const [files, setFiles] = useState([]);
  const fileQuery = useQuery(
    ['query-files'],
    () => {
      return new Promise(async (resolve) => {
        api
          .get('/files')
          .then((res) =>
            setFiles([
              ...res.data.folders.map((e) => ({ ...e, isFolder: true })),
              ...res.data.files,
            ]),
          )
          .catch((err) => console.error('❌ Failed to fetch files:', err));
        resolve();
      });
    },
    { refetchOnWindowFocus: false },
  );
  // Chakra Color Mode
  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid
        mb="20px"
        columns={{ sm: 1 }}
        spacing={{ base: '20px', xl: '20px' }}
      >
        {/* <DevelopmentTable
          columnsData={columnsDataDevelopment}
          tableData={tableDataDevelopment}
        /> */}
        <FileTable
          dataQuery={fileQuery}
          columnsData={columnsFileData}
          tableData={files.map((e) => ({
            ...e,
            name: [e.filename || e?.name, false],
          }))}
        />
        {/* <ColumnsTable
          columnsData={columnsDataColumns}
          tableData={tableDataColumns}
        />
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        /> */}
      </SimpleGrid>
    </Box>
  );
}
