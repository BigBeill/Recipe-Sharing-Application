'use client'

import { useState, useRef } from 'react'
import GrowingText from '@/shared/components/GrowingText';
import { RelationshipType, UserType } from '../domain/user.types';
import ImageUploader from '@/features/images/components/ImageUploader';
import { useRouter } from 'next/navigation';
import useAuth from '@/features/auth/hooks/useAuth';
import { unpackImage } from '@/features/images/services/image.services';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import styles from './profilePage.module.scss';
import { ButtonOval, ButtonShielded } from '@/shared/components/Button.components';
import { InputTextArea } from '@/shared/components/Input.components';
import { DataHandle } from '@/shared/shared.types';
import { userService } from '../services/user.service.client';

interface Props {
   initial: UserType
}

export default function ProfilePage({ initial }: Props) {

   const [user, setUser] = useState<UserType>(initial);
   const [modifiedUser, setModifiedUser] = useState<UserType | null>(null);

   const router = useRouter();
   const { logout } = useAuth();

   const bioRef = useRef<DataHandle<string>>(null);
   const imageRef = useRef<DataHandle<File | null>>(null);

   const userMutator = useServiceMutation((newUser: UserType): Promise<UserType> => { return userService.update(newUser); })

   async function saveChanges() {
      if (!modifiedUser) { return; }

      const mutatedUser = await userMutator.send(modifiedUser);
      setUser((previous) => { return { ...mutatedUser, relationship: previous.relationship } });
      setModifiedUser(null);
   }

   // mutator for setting the relationship.type field of another user
   const relationshipMutator = useServiceMutation((newRelationship: 'none' | 'requestReceived' | 'friend'): Promise<RelationshipType> => {
      const relationship: RelationshipType = user.relationship!;
      if (newRelationship === 'none') { 
         if (relationship.type === 'friend') { return userService.removeFriend(relationship._id); }
         else if (relationship.type === 'requestReceived' || relationship.type === 'requestSent') { return userService.processFriendRequest(relationship._id, { accept: false}); }
      }
      if (newRelationship === 'requestReceived' && relationship.type === 'none') { return userService.sendFriendRequest(relationship.owner); }
      if (newRelationship === 'friend' && relationship.type === 'requestSent') { return userService.processFriendRequest(relationship._id, { accept: true }); }

      // If the request does not match any of the above conditions and trigger a return then send an error
      console.error('Unable to set the targets relationship with this user to: ' + newRelationship + ' their current relationship with this user is: ' + relationship.type);
      throw new Error('relationship cannot be set to ' + newRelationship);
   });

   async function updateRelationship(newRelationship: 'none' | 'requestReceived' | 'friend') {
      const mutatedRelationship = await relationshipMutator.send(newRelationship);
      setUser((previous) => { return { ...previous, relationship: mutatedRelationship } });
   }

   // handle logout function
   function handleLogout() {
      logout()
         .then(() => router.push('/login'));
   }

   return (
      <div className={ styles.userProfile }>
         <GrowingText text={ user.name }/>
         <div>
            { !modifiedUser ? (
               <img className='consumeSpace' { ...unpackImage(user.image) }/>
            ) : (
               <ImageUploader
                  ref={ imageRef }
                  initial={ user.image }
                  category={ 'user' }
               />
            ) }
         </div>

         <div> {/* styleDiv, should not contain anything */} </div>

         <div>
            <p>id: { String(user._id) }</p>
            <p>username: { user.name }</p>
         </div>

         <InputTextArea 
            label='Personal Bio' 
            placeholder='Talk about yourself' 
            dataRef={ bioRef }
            initial={ user.bio }
            readOnlyOptions={ {
               condition: !modifiedUser,
               placeholder: "No bio created yet"
            } }
         />

         <div> {/* styleDiv, should not contain anything */} </div>

         {/* display the appropriate set of two buttons */}
         <div className="splitSpace">
            { modifiedUser ? (
               <>
                  <ButtonShielded key='save' message='Save Changes' loadingState={ userMutator.status === 'loading' } onClick={ saveChanges } />
                  <ButtonShielded key='delete' message='Delete Changes' onClick={ () => { setModifiedUser(null); } }/>
               </>
            ) : user.relationship?.type == "none" ? (
               <>
                  <ButtonOval loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('requestReceived'); } }>Send friend request</ButtonOval>
               </>
            ) : user.relationship?.type == "friend" ? (
               <>
                  <ButtonShielded message='Remove Friend' loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('none') } } />
               </>
            ) : user.relationship?.type == "requestReceived" ? (
               <>
                  <ButtonOval loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('none') } }>Cancel friend request</ButtonOval>
               </>
            ) : user.relationship?.type == "requestSent" ? (
               <>
                  <ButtonOval loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('friend'); } }>Accept friend request</ButtonOval>
                  <ButtonOval loadingState={ relationshipMutator.status === 'loading' } onClick={ () => { updateRelationship('none'); } }>Reject friend request</ButtonOval>
               </>
            ) : user.relationship?.type == "self" ? (
               <>
                  <ButtonOval onClick={ () => { setModifiedUser(user); } }> edit account </ButtonOval>
                  <ButtonShielded key='logout' message="logout" onClick={ () => { handleLogout(); } }/>
               </>
            ) : null }
         </div>

      </div >
   )
}