'use client'

import { useState, useRef } from 'react'
import GrowingText from '@/shared/view/components/GrowingText.component';
import ImageUploader from '@/features/images/components/ImageUploader';
import styles from './profilePage.module.scss';
import { TypeDataHandle } from '@/shared/domain/shared.types';
import { userService } from '../services/user.service.client';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { InputString } from '@/shared/view/components/Input.components';
import { TypeImageReference } from '@/features/images/domain/image.types';
import { TypeUser } from '../domain/user.types';
import harvestRefsObject from '@/shared/lib/harvestRefCollection';
import ImageDisplay from '@/features/images/components/ImageDisplay';
import StrategyRelationshipInteraction from '@/features/relationships/view/strategy/Interaction.strategy';
import { EditProvider } from '@/shared/hooks/editContext';
import { TypeRelationship } from '@/features/relationships/domain/relationship.types';

interface Props {
   initial: TypeUser
}

export default function ProfilePage({ initial }: Props) {

   console.log(initial);

   const { session, sessionStatus } = useAuth();
   if (sessionStatus !== 'authenticated') { throw new Error("Attempting to call ProfilePage without an authenticated session"); }

   const [user, setUser] = useState<TypeUser>(initial);

   const refs = {
      name: useRef<TypeDataHandle<string>>(null),
      bio: useRef<TypeDataHandle<string>>(null),
      imageReference: useRef<TypeDataHandle<TypeImageReference | undefined>>(null),
   }

   // ? functions and variables for editing the current user
   const [editMode, setEditMode] = useState<boolean>(false);

   const saveMutator = useServiceMutation<never, void>(async () => {
      const updatedUser = await userService.update(await harvestRefsObject(refs));
      setUser(updatedUser);
      setEditMode(false);
   });

   return (
      <EditProvider 
         value={ {
            active: editMode,
            trigger: () => { setEditMode(true); },
            saveMutator
         } }
      >
      <div className={ styles.userProfile }>
         <GrowingText text={ user.name }/>
         { editMode ? 
            <ImageUploader
               ref={ refs.imageReference }
               initial={ user.signedImageUrl }
               category={ 'users' }
            />
         :
            <ImageDisplay style={ { width: '12rem', height: '12rem' } } category='users' signedImageUrl={user.signedImageUrl} />
         }

         <div> {/* styleDiv, should not contain anything */} </div>

         <div>
            <p>id: { String(user._id) }</p>
            <InputString type='text' label='Username' initial={ user.name } ref={ refs.name } readOnlyOptions={ { condition: !editMode, placeholder: 'Issue loading username' } } />
         </div>

         <InputString 
            type='textarea'
            label='Personal Bio' 
            placeholder='Talk about yourself' 
            ref={ refs.bio }
            initial={ user.bio }
            readOnlyOptions={ {
               condition: !editMode,
               placeholder: "No bio created yet"
            } }
         />

         <div> {/* styleDiv, should not contain anything */} </div>

         {/* display the appropriate set of two buttons */}
         <StrategyRelationshipInteraction 
            relationship={ user.relationship ?? { ownerId: user._id, targetId: session.userId } }
            updateRelationship={ (relationship: TypeRelationship | null) => { setUser((previous) => { return { ...previous, relationship } }) } }
         />
      </div >
      </EditProvider>
   )
}