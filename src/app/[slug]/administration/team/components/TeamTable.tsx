'use client';

import Dialog from '@/components/modal/Dialog';
import { ListBox } from '@/components/shared/ListBox';
import PopoverTrigger from '@/components/shared/PopoverTrigger';
import Table from '@/components/table/Table';
import {
   Cell,
   Column,
   Item,
   Row,
   SortDirection,
   TableBody,
   TableHeader,
} from 'react-stately';
import CircleRoundedIcon from '@mui/icons-material/Circle';
import CircleOutlinedRoundedIcon from '@mui/icons-material/CircleOutlined';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import Link from 'next/link';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { Dispatch, Key, SetStateAction, useState } from 'react';
import Button from '@/components/shared/Button';
import { useAppSelector } from '@/lib/hooks/redux-hooks';
import { User } from '@/types/user';
import Image from 'next/image';
import { translateRole } from '@/lib/utils';
import { clinicRoutes } from '@/lib/routes';
import DeactivateUserModal from '@/components/shared/modals/DeactivateUserModal';
import RemoveUserModal from '@/components/shared/modals/RemoveUserModal';

interface ITeamTable {
   users: User[];
   setUsers: Dispatch<SetStateAction<User[]>>;
   directionState: [SortDirection, Dispatch<SetStateAction<SortDirection>>];
   columnState: [Key | undefined, Dispatch<SetStateAction<Key | undefined>>];
}

export default function TeamTable({
   users,
   setUsers,
   directionState,
   columnState,
}: ITeamTable) {
   const [direction, setDirection] = directionState;
   const [column, setColumn] = columnState;
   const [changingId, setChangingId] = useState<number>();
   const [removingId, setRemovingId] = useState<number>();

   const { slug } = useAppSelector(store => store.clinic);

   return (
      <>
         {changingId !== undefined && (
            <DeactivateUserModal
               isOpen
               id={changingId}
               setIsOpen={val => !val && setChangingId(undefined)}
               slug={slug}
            />
         )}
         {removingId !== undefined && (
            <RemoveUserModal
               isOpen
               id={removingId}
               setIsOpen={val => !val && setRemovingId(undefined)}
               slug={slug}
            />
         )}
         <Table
            className="w-full"
            selectionMode="none"
            onSortChange={desc => {
               setDirection(prev =>
                  prev === 'ascending' ? 'descending' : 'ascending',
               );
               setColumn(desc.column);
            }}
            sortDescriptor={{ column, direction }}
         >
            <TableHeader>
               <Column allowsSorting key="names">
                  Nombre de personal
               </Column>
               <Column allowsSorting key="phone">
                  Teléfono
               </Column>
               <Column allowsSorting key="email">
                  Correo
               </Column>
               <Column allowsSorting key="enabled">
                  <span className="w-full text-center">Estado</span>
               </Column>
               <Column key="details">{true}</Column>
               <Column key="option">{true}</Column>
            </TableHeader>
            <TableBody>
               {users.map(user => (
                  <Row key={user.id}>
                     <Cell>
                        <span
                           aria-label="user name"
                           className={`${
                              !user.enabled && 'text-on-background-disabled'
                           }`}
                        >
                           <div className="flex gap-3">
                              <div className="relative aspect-square h-max w-10">
                                 <Image
                                    src={
                                       user.profile_picture.length
                                          ? user.profile_picture
                                          : '/default_profile_picture.svg'
                                    }
                                    className="rounded-full object-cover object-center"
                                    alt="user image"
                                    fill
                                 />
                              </div>
                              <div className="col-[2/3] flex flex-col justify-between justify-self-start">
                                 <span className="font-semibold">
                                    {user.names} {user.last_names}
                                 </span>
                                 <span className="text-sm text-on-background-text">
                                    {translateRole(user.role)}
                                 </span>
                              </div>
                           </div>
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !user.enabled && 'text-on-background-disabled'
                           }`}
                        >
                           {user.phone}
                        </span>
                     </Cell>
                     <Cell>
                        <span
                           className={`${
                              !user.enabled && 'text-on-background-disabled'
                           }`}
                        >
                           {user.email}
                        </span>
                     </Cell>
                     <Cell>
                        <Button
                           onPress={() => setChangingId(user.id)}
                           className={`m-auto flex !w-max gap-2 bg-transparent !p-0 font-normal !text-black ${
                              !user.enabled && '!text-on-background-disabled'
                           }`}
                        >
                           {changingId === user.id ? (
                              <>Cambiando...</>
                           ) : user.enabled ? (
                              <>
                                 <CircleRoundedIcon className="!fill-success" />
                                 Activo
                              </>
                           ) : (
                              <>
                                 <CircleOutlinedRoundedIcon />
                                 Inactivo
                              </>
                           )}
                           <ArrowDropDownRoundedIcon className="!fill-on-background-text" />
                        </Button>
                     </Cell>
                     <Cell>
                        <Link
                           className="text-secondary underline underline-offset-2"
                           href={
                              clinicRoutes(slug).admin_team_id(user.id).details
                           }
                        >
                           Ver detalles
                        </Link>
                     </Cell>
                     <Cell>
                        <SeeMoreButton
                           slug={slug}
                           id={user.id}
                           setRemovingId={setRemovingId}
                        />
                     </Cell>
                  </Row>
               ))}
            </TableBody>
         </Table>
      </>
   );
}

interface ISeeMoreButton {
   id: number;
   slug: string;
   setRemovingId: Dispatch<SetStateAction<number | undefined>>;
}

function SeeMoreButton({ id, slug, setRemovingId }: ISeeMoreButton) {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <PopoverTrigger
         isOpen={isOpen}
         onOpenChange={setIsOpen}
         trigger={<MoreVertRoundedIcon className="!fill-on-background-text" />}
      >
         <Dialog className="rounded">
            <ListBox className="right-0 !p-0 !py-2 shadow-xl">
               <Item textValue="Editar">
                  <Link href={clinicRoutes(slug).admin_team_id(id).edit}>
                     <div className="w-full py-3 pl-8">Editar</div>
                  </Link>
               </Item>
               <Item textValue="Eliminar">
                  <Button
                     onPress={() => {
                        setRemovingId(id);
                        setIsOpen(false);
                     }}
                     className="w-full bg-transparent !py-3 !pl-8 text-start !font-normal !text-secondary"
                  >
                     Retirar usuario
                  </Button>
               </Item>
            </ListBox>
         </Dialog>
      </PopoverTrigger>
   );
}
