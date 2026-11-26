import 'client-only';

import { useServiceMutation } from '@/shared/hooks/useServiceMutation';
import { ButtonOval, ButtonShielded } from '@/shared/view/components/Button.components';
import { authService } from '@/features/auth/services/auth.service.client';
import { relationshipService } from '../../services/relationship.service.client';
import { TypeRelationship } from '../../domain/relationship.types';
import { useEditContext } from '@/shared/hooks/editContext';
import { LoadingProvider } from '@/shared/hooks/loadingContext';
import { userService } from '@/features/users/services/user.service.client';
import { useRouter } from 'next/navigation';
import ReauthenticatePopup from '@/features/auth/view/components/ReauthenticateAction';
import { useRef } from 'react';
import { TypeDataHandle } from '@/shared/domain/shared.types';

type PartialRelationship = TypeRelationship | Omit<TypeRelationship, '_id' | 'type'>

export default function StrategyRelationshipInteraction({ relationship, updateRelationship }: { relationship: PartialRelationship, updateRelationship: (newRelationship: TypeRelationship | null) => void }) {
   return (
      <div className='splitSpace'>
         { renderStrategy(relationship, updateRelationship) }
      </div>
   );
}

function renderStrategy(relationship: PartialRelationship, updateRelationship: (newRelationship: TypeRelationship | null) => void) {
   if ('_id' in relationship) { return relationshipInteractionStrategies[relationship.type](relationship, updateRelationship); }
   else {
      if (relationship.ownerId === relationship.targetId) { return relationshipInteractionStrategies.self() }
      else { return relationshipInteractionStrategies.NoRelationship(relationship, updateRelationship) }
   }
}

const relationshipInteractionStrategies = {
   NoRelationship: NoRelationshipInteraction,
   self: SelfInteraction,
   requestReceived: RequestReceivedInteraction,
   requestSent: RequestSentInteraction,
   friend: FriendInteraction,
}

function NoRelationshipInteraction(relationship: PartialRelationship, updateRelationship: (newRelationship: TypeRelationship | null) => void) {
   const friendRequestMutator = useServiceMutation(async () => { 
      const newRelationship = await relationshipService.sendFriendRequest(relationship.ownerId); 
      updateRelationship(newRelationship);
   });
   return <ButtonOval onClick={ friendRequestMutator.send }>Send Friend Request</ButtonOval>
}

function SelfInteraction() {
   const router = useRouter();
   const reauthenticateRef = useRef<TypeDataHandle<boolean>>(null);
   const editContext = useEditContext();
   const logoutMutator = useServiceMutation(async () => { await authService.logout(); });
   if (editContext.active) {
      <LoadingProvider value={ editContext.saveMutator.status === 'loading' }>
         <ButtonShielded onClick={ editContext.saveMutator.send } message='Save Changes' showLoading={ true } />
         <ButtonShielded onClick={ () => { reauthenticateRef.current?.setData(true); } } message='Delete Account' />
         <ReauthenticatePopup ref={ reauthenticateRef } action={ { description: 'Deleting an account', function: (async (password: string) => { await userService.delete(password); router.push('/') } ) } } />
      </LoadingProvider>
   }
   else {
      return (
         <LoadingProvider value={ logoutMutator.status === 'loading' }>
            <ButtonShielded onClick={ editContext.trigger } message='Edit Account'/>
            <ButtonShielded onClick={ logoutMutator.send } message='Logout' showLoading={ true }/>
         </LoadingProvider>
      );
   }
}

function RequestSentInteraction(relationship: TypeRelationship, updateRelationship: (newRelationship: TypeRelationship | null) => void) {
   const friendRequestMutator = useServiceMutation(async (approve: boolean) => { 
      const newRelationship = await relationshipService.processFriendRequest(relationship._id, { approve });
      updateRelationship(newRelationship);
   });
   return (
      <>
         <ButtonOval onClick={ () => { friendRequestMutator.send(true); } } >Accept Friend Request</ButtonOval>
         <ButtonOval onClick={ () => { friendRequestMutator.send(false); } } >Reject Friend Request</ButtonOval>
      </>
   );
}

function RequestReceivedInteraction(relationship: TypeRelationship, updateRelationship: (newRelationship: TypeRelationship | null) => void) {
   const friendRequestMutator = useServiceMutation(async (approve: boolean) => { 
      const newRelationship = await relationshipService.processFriendRequest(relationship._id, { approve });
      updateRelationship(newRelationship);
   });
   return <ButtonOval onClick={ () => { friendRequestMutator.send(false); } } >Cancel Friend Request</ButtonOval>;
}

function FriendInteraction(relationship: TypeRelationship, updateRelationship: (newRelationship: TypeRelationship | null) => void) {
   const friendshipMutator = useServiceMutation(async () => { 
      const newRelationship = await relationshipService.removeFriend(relationship._id);
      updateRelationship(newRelationship);
   });
   return <ButtonShielded onClick={ friendshipMutator.send } message='Remove Friend' />;
}