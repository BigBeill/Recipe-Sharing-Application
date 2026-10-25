'use client'

import { useState, useRef } from 'react'
import GrowingText from '@/shared/view/components/GrowingText.component';
import ImageUploader from '@/features/images/components/ImageUploader';
import { useRouter } from 'next/navigation';
import styles from './profilePage.module.scss';
import { DataHandle } from '@/shared/domain/shared.types';
import { userService } from '../services/user.service.client';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { useServiceMutation } from '@/shared/lib/hooks/useServiceMutation';
import { LoadingProvider } from '@/shared/lib/hooks/loadingContext';
import { ButtonOval, ButtonShielded } from '@/shared/view/components/Button.components';
import { InputString } from '@/shared/view/components/Input.components';
import { TypeImageReference } from '@/features/images/domain/image.types';
import { TypeRelationship, TypeUser } from '../domain/user.types';
import harvestRefsObject from '@/shared/lib/harvestRefsObject';

interface Props {
   initial: TypeUser
}

export default function ProfilePage({ initial }: Props) {
   const router = useRouter();
   const { session, sessionStatus, logoutSession } = useAuth();
   if (sessionStatus === 'pending') { throw new Error("Attempting to call ProfilePage with a sessionStatus of pending") }
   if (sessionStatus === 'guest') { return router.replace('/login'); }

   const [user, setUser] = useState<TypeUser>(initial);

   const refs = {
      name: useRef<DataHandle<string>>(null),
      bio: useRef<DataHandle<string>>(null),
      imageReference: useRef<DataHandle<TypeImageReference | undefined>>(null),
   }

   // ? functions and variables for editing the current user
   const [editMode, setEditMode] = useState<boolean>(false);
   const userMutator = useServiceMutation(async (): Promise<TypeUser> => { return await userService.update(user._id, (await harvestRefsObject(refs))) });

   async function saveChanges() {
      if (!editMode) { return; }

      setUser(await userMutator.send());
   }

   // mutator for setting the relationship.type field of another user
   const relationshipMutator = useServiceMutation(session?.userId === user._id ? async () => { return null; } 
      : async (newRelationship: 'none' | 'requestReceived' | 'friend'): Promise<TypeRelationship | null> => {
         if (newRelationship === 'none') {
            if (user.relationship?.type === 'friend') { return userService.removeFriend(user.relationship._id); }
            else if (user.relationship?.type === 'requestReceived' || user.relationship?.type === 'requestSent') { return userService.processFriendRequest(user.relationship._id, { accept: false}); }
         }
         if (newRelationship === 'requestReceived' && user.relationship?.type !== null) { return userService.sendFriendRequest(user._id); }
         if (newRelationship === 'friend' && user.relationship?.type === 'requestSent') { return userService.processFriendRequest(user.relationship._id, { accept: true }); }
         return null;
      }
   );

   async function updateRelationship(newRelationship: 'none' | 'requestReceived' | 'friend') {
      const mutatedRelationship = await relationshipMutator.send(newRelationship);
      setUser((previous) => { return { ...previous, relationship: mutatedRelationship } });
   }

   // handle logout function
   function handleLogout() {
      logoutSession()
         .then(() => router.push('/login'));
   }

   return (
      <div className={ styles.userProfile }>
         <GrowingText text={ user.name }/>
         <ImageUploader
            ref={ refs.imageReference }
            initial={ user.imageReference }
            category={ 'users' }
         />

         <div> {/* styleDiv, should not contain anything */} </div>

         <div>
            <p>id: { String(user._id) }</p>
            <InputString type='text' label='Username' initial={ user.name } ref={ refs.name } readOnlyOptions={ { condition: editMode, placeholder: 'Issue loading username' } } />
         </div>

         <InputString 
            type='textarea'
            label='Personal Bio' 
            placeholder='Talk about yourself' 
            ref={ refs.bio }
            initial={ user.bio }
            readOnlyOptions={ {
               condition: editMode,
               placeholder: "No bio created yet"
            } }
         />

         <div> {/* styleDiv, should not contain anything */} </div>

         {/* display the appropriate set of two buttons */}
         <LoadingProvider value={ relationshipMutator.status === 'loading' || userMutator.status === 'loading' }>
            <div className="splitSpace">
               { editMode ? (
                  <>
                     <ButtonShielded key='save' message='Save Changes' showLoading={ true } onClick={ saveChanges } />
                     <ButtonShielded key='delete' message='Delete Changes' onClick={ () => { setEditMode(false); } }/>
                  </>
               ) : session?.userId === user._id ? (
                  <>
                     <ButtonOval onClick={ () => { setEditMode(true); } }> edit account </ButtonOval>
                     <ButtonShielded key='logout' message="logout" onClick={ () => { handleLogout(); } }/>
                  </>
               ) : user.relationship === null ? (
                  <>
                     <ButtonOval showLoading={ true } onClick={ () => { updateRelationship('requestReceived'); } }>Send friend request</ButtonOval>
                  </>
               ) : user.relationship?.type == "friend" ? (
                  <>
                     <ButtonShielded message='Remove Friend' showLoading={ true } onClick={ () => { updateRelationship('none') } } />
                  </>
               ) : user.relationship?.type == "requestReceived" ? (
                  <>
                     <ButtonOval showLoading={ true } onClick={ () => { updateRelationship('none') } }>Cancel friend request</ButtonOval>
                  </>
               ) : user.relationship?.type == "requestSent" ? (
                  <>
                     <ButtonOval showLoading={ true } onClick={ () => { updateRelationship('friend'); } }>Accept friend request</ButtonOval>
                     <ButtonOval showLoading={ true } onClick={ () => { updateRelationship('none'); } }>Reject friend request</ButtonOval>
                  </>
               ) : user.relationship?.type == "self" ? (
                  <>
                     <ButtonOval onClick={ () => { setEditMode(true); } }> edit account </ButtonOval>
                     <ButtonShielded key='logout' message="logout" onClick={ () => { handleLogout(); } }/>
                  </>
               ) : null }
            </div>
         </LoadingProvider>

      </div >
   )
}