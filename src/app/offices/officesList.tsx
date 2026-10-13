/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import CallMadeOutlinedIcon from '@mui/icons-material/CallMadeOutlined';
import Link from 'next/link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { useEffect } from 'react';
import GetCompaniesList from '../api/get/companies';


export default function OfficesList() {
    const { CompaniesList, FetchCompaniesList }: any = GetCompaniesList()

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
            fontFamily: 'alata',
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 18,
            fontFamily: 'alata',
        },
    }));

    useEffect(() => {
        FetchCompaniesList({ tenantId: '381' })
    }, [FetchCompaniesList])

    return (
        <>
            <section className='py-[50px] bg-[#fff] px-[20px]'>
                <div className="max-w-[1200px] mx-auto border border-[#ddd] rounded-[10px] shadow-md">
                    <p className="text-[30px] text-[#333] border-b border-[#ddd] font-semibold p-[15px]">Offices List</p>
                    <div className="overflow-x-auto">
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableBody>
                                    {CompaniesList.map((row: any, index: any) => (
                                        <StyledTableRow
                                            key={index}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <StyledTableCell
                                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                                align="center"
                                            >
                                                {row.navn}
                                            </StyledTableCell>
                                            <StyledTableCell
                                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                                align="center"
                                            >
                                                <p className="flex items-center gap-[5px] text-[#333] font-medium text-[18px]">
                                                    {/* <PlaceOutlinedIcon fontSize='medium' className='text-[#caa950]' /> */}
                                                    {row.registrertDato || '-'}
                                                </p>
                                            </StyledTableCell>
                                            <StyledTableCell
                                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                                align="center"
                                            >
                                                <p className="flex items-center gap-[5px] text-[#333] font-medium text-[18px]">
                                                    {/* <PlaceOutlinedIcon fontSize='medium' className='text-[#caa950]' /> */}
                                                    {row.endretDato || '-'}
                                                </p>
                                            </StyledTableCell>
                                            <StyledTableCell
                                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                                align="center"
                                            >
                                                <Link href='tel:480 03 992' className='text-[#333] font-medium text-[18px]'>
                                                    {row.organisasjonsnummer || '-'}
                                                </Link>
                                            </StyledTableCell>
                                            <StyledTableCell
                                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                                align="center"
                                            >
                                                <Link href='emailto:email@gmail.com' className='text-[#333] font-medium text-[18px]'>
                                                    {row.email || '-'}
                                                </Link>
                                            </StyledTableCell>
                                            <StyledTableCell
                                                sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                                align="center"
                                            >
                                                <Link href={`/officeDetails?id=${row?.id}`}>
                                                    <CallMadeOutlinedIcon fontSize='medium' className='' />
                                                </Link>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </section>
        </>
    );
}
