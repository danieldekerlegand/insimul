import json
import time
from game import Game

# Generate a town!
sim = Game()  # Objects of the class Simulation are Talk of the Town simulations
# Simulate from the date specified as the start of town generation to the date specified
# as its terminus; both of these dates can be set in config/basic_config.py
try:
    sim.establish_setting()  # This is the worldgen procedure
    town = sim.city
except KeyboardInterrupt:  # Enter "ctrl+C" (a keyboard interrupt) to end worldgen early
    # In the case of keyboard interrupt, we need to tie up a few loose ends
    sim.advance_time()
    for person in list(sim.city.residents):
        person.routine.enact()

# Missing: whereabouts, life events (maybe add event with id?), full data about past occupations,
# story sifting nuggets
cast = []
history = []
places = []
lots = []

########## Export Cast ##########
for character in sorted(sim.city.all_time_residents, key=lambda c: c.id):
    cast_member = {
        "id": character.id,
        "first name": character.first_name,
        "middle name": character.middle_name,
        "last name": character.last_name,
        "maiden name": character.maiden_name,
        "suffix": character.suffix,
        "full name": character.full_name,
        "first name namesake": (
            character.named_for[0].id if character.named_for and character.named_for[0] else None
        ),
        "middle name namesake": (
            character.named_for[1].id if character.named_for and character.named_for[1] else None
        ),
        "born here": bool(character.birth),
        "birth year": character.birth_year,
        "birthdate": character.birth.date if character.birth else None,
        "birth doctor": (
            character.birth.doctor.person.id if character.birth and character.birth.doctor else None
        ),
        "birth nurses": [nurse.person.id for nurse in character.birth.nurses] if character.birth else [],
        "birth hospital": character.birth.hospital.id if character.birth and character.birth.hospital else None,
        "death year": character.death_year,
        "death date": character.death.date if character.death else None,
        "cause of death": character.death.cause if character.death else None,
        "next of kin": character.death.next_of_kin.id if character.death else None,
        "death mortician": (
            character.death.mortician.person.id if character.death and character.death.mortician else None
        ),
        "burial place": character.death.cemetery.id if character.death and character.death.cemetery else None,
        "appearance": {
            "eye vertical settedness": character.face.eyes.vertical_settedness,
            "eye horizontal settedness": character.face.eyes.horizontal_settedness,
            "eye color": character.face.eyes.color,
            "eye shape": character.face.eyes.shape,
            "eye size": character.face.eyes.size,
            "skin color": character.face.skin.color,
            "ear angle": character.face.ears.angle,
            "ear size": character.face.ears.size,
            "mouth size": character.face.mouth.size,
            "head size": character.face.head.size,
            "head shape": character.face.head.shape,
            "eyebrow color": character.face.eyebrows.color,
            "eyebrow size": character.face.eyebrows.size,
            "facial hair style": character.face.facial_hair.style,
            "hair color": character.face.hair.color,
            "hair length": character.face.hair.length,
            "nose size": character.face.nose.size,
            "nose shape": character.face.nose.shape,
            "tattoo": character.face.distinctive_features.tattoo,
            "sunglasses": character.face.distinctive_features.sunglasses,
            "freckles": character.face.distinctive_features.freckles,
            "birthmark": character.face.distinctive_features.birthmark,
            "scar": character.face.distinctive_features.scar,
            "glasses": character.face.distinctive_features.glasses
        }
    }
    
    cast.append(cast_member)  # Character with id i will be in cast[i]
    
for character in sorted(sim.city.all_time_residents, key=lambda c: c.id):
    ########## Export Attributes ##########
    
    def add_attribute(attribute_name, attribute_value):
        history.append({
            "category": "attribute",
            "type": attribute_name,
            "value": attribute_value,
            "first": character.full_name
        })
        
    add_attribute("openness", character.personality.openness_to_experience)
    add_attribute("conscientiousness", character.personality.conscientiousness)
    add_attribute("extroversion", character.personality.extroversion)
    add_attribute("agreeableness", character.personality.agreeableness)
    add_attribute("neuroticism", character.personality.neuroticism)
    
    ########## Export Relationships ##########
    
    def add_relationship(relationship_name, second):
        history.append({
            "category": "relationship",
            "type": relationship_name,
            "value": True,
            "first": character.full_name,
            "second": second
        })
    
    add_relationship("mother", cast[character.mother.id]["full name"]) if character.mother else None
    add_relationship("father", cast[character.father.id]["full name"]) if character.father else None
    add_relationship("spouse", cast[character.spouse.id]["full name"]) if character.spouse else None
    add_relationship("bestFriend", cast[character.best_friend.id]["full name"]) if character.best_friend else None
    add_relationship("worstEnemy", cast[character.worst_enemy.id]["full name"]) if character.worst_enemy else None
    add_relationship("strongestLoveInterest", cast[character.love_interest.id]["full name"]) if character.love_interest else None
    add_relationship("significantOther", cast[character.significant_other.id]["full name"]) if character.significant_other else None
    
    [add_relationship("descendant", cast[ancestor.id]["full name"]) for ancestor in character.ancestors]
    [add_relationship("ancestor", cast[descendant.id]["full name"]) for descendant in character.descendants]
    [add_relationship("immediate_family", cast[family_member.id]["full name"]) for family_member in character.immediate_family]
    [add_relationship("extended_family", cast[family_member.id]["full name"]) for family_member in character.extended_family]
    [add_relationship("grandparents", cast[grandparent.id]["full name"]) for grandparent in character.grandparents]
    [add_relationship("greatgrandparents", cast[greatgrandparent.id]["full name"]) for greatgrandparent in character.greatgrandparents]
    [add_relationship("aunts", cast[aunt.id]["full name"]) for aunt in character.aunts]
    [add_relationship("uncles", cast[uncle.id]["full name"]) for uncle in character.uncles]
    [add_relationship("siblings", cast[sibling.id]["full name"]) for sibling in character.siblings]
    [add_relationship("full_siblings", cast[full_sibling.id]["full name"]) for full_sibling in character.full_siblings]
    [add_relationship("half_siblings", cast[half_sibling.id]["full name"]) for half_sibling in character.half_siblings]
    [add_relationship("brothers", cast[brother.id]["full name"]) for brother in character.brothers]
    [add_relationship("full_brothers", cast[full_brother.id]["full name"]) for full_brother in character.full_brothers]
    [add_relationship("half_brothers", cast[half_brother.id]["full name"]) for half_brother in character.half_brothers]
    [add_relationship("sisters", cast[sister.id]["full name"]) for sister in character.sisters]
    [add_relationship("full_sisters", cast[full_sister.id]["full name"]) for full_sister in character.full_sisters]
    [add_relationship("half_sisters", cast[half_sister.id]["full name"]) for half_sister in character.half_sisters]
    [add_relationship("cousins", cast[cousin.id]["full name"]) for cousin in character.cousins]
    [add_relationship("kids", cast[kid.id]["full name"]) for kid in character.kids]
    [add_relationship("sons", cast[son.id]["full name"]) for son in character.sons]
    [add_relationship("daughters", cast[daughter.id]["full name"]) for daughter in character.daughters]
    [add_relationship("nephews", cast[nephew.id]["full name"]) for nephew in character.nephews]
    [add_relationship("nieces", cast[niece.id]["full name"]) for niece in character.nieces]
    [add_relationship("grandchildren", cast[grandchild.id]["full name"]) for grandchild in character.grandchildren]
    [add_relationship("grandsons", cast[grandson.id]["full name"]) for grandson in character.grandsons]
    [add_relationship("granddaughters", cast[granddaughter.id]["full name"]) for granddaughter in character.granddaughters]
    [add_relationship("greatgrandchildren", cast[greatgrandchild.id]["full name"]) for greatgrandchild in character.greatgrandchildren]
    [add_relationship("greatgrandsons", cast[greatgrandson.id]["full name"]) for greatgrandson in character.greatgrandsons]
    [add_relationship("greatgranddaughters", cast[greatgranddaughter.id]["full name"]) for greatgranddaughter in character.greatgranddaughters]
    [add_relationship("friends", cast[friend.id]["full name"]) for friend in character.friends]
    [add_relationship("enemies", cast[enemy.id]["full name"]) for enemy in character.enemies]
    [add_relationship("acquaintances", cast[acquaintance.id]["full name"]) for acquaintance in character.acquaintances]
    [add_relationship("neighbors", cast[neighbor.id]["full name"]) for neighbor in character.neighbors]
    [add_relationship("formerNeighbors", cast[former_neighbor.id]["full name"]) for former_neighbor in character.former_neighbors]
    [add_relationship("coworkers", cast[coworker.id]["full name"]) for coworker in character.coworkers]
    [add_relationship("formerCoworkers", cast[former_coworkers.id]["full name"]) for former_coworkers in character.former_coworkers]
    [add_relationship("sexualPartners", cast[partner.id]["full name"]) for partner in character.sexual_partners]
    
    ########## Export Networks ##########
    
    def add_network(network_name, value, second):
        history.append({
            "category": "network",
            "type": network_name,
            "value": value,
            "first": character.full_name,
            "second": second
        })
    
    [add_network("charge_value", character.relationships[subject].charge, cast[subject.id]["full name"]) for subject in character.relationships]
    [add_network("spark_value", character.relationships[subject].spark, cast[subject.id]["full name"]) for subject in character.relationships]
    [add_network("compatibility", character.relationships[subject].compatibility * 100, cast[subject.id]["full name"]) for subject in character.relationships]
    [add_network("salience", int(round(character.salience_of_other_people[subject] if subject is not character else 999)), cast[subject.id]["full name"]) for subject in character.salience_of_other_people]
    
    ########## Export Directed Statuses ##########
    
    def add_directed_status(directed_status_name, second):
        history.append({
            "category": "directed_status",
            "type": directed_status_name,
            "value": True,
            "first": character.full_name,
            "second": second
        })
        
    add_directed_status("impregnated_by", cast[character.impregnated_by.id]["full name"]) if character.impregnated_by else None
    # add_directed_status("currentLocation", places[character.location.id]["name"]) if character.location else None
    
    ########## Export Events ##########
    
    # "lifeEvents": [str(life_event) for life_event in character.life_events],
    
    # "whereTheyMet": (
    #     {subject.id: character.relationships[subject].where_they_met.id for subject in character.relationships}
    # )
    
    # "whenTheyMet": (
    #     {subject.id: character.relationships[subject].when_they_met for subject in character.relationships}
    # )
    
    # "whereTheyLastMet": {
    #     subject.id: character.relationships[subject].where_they_last_met.id for subject in character.relationships
    # }
    
    # "whenTheyLastMet": {
    #     subject.id: character.relationships[subject].when_they_last_met for subject in character.relationships
    # }
    
    # "totalInteractions": {
    #     subject.id: character.relationships[subject].total_interactions for subject in character.relationships
    # }
    
    # "mostSalientRelationship": {
    #     subject.id: character.relation_to_me(person=subject) for subject in character.city.all_time_residents
    # }
    
    ######### Export Statuses #########
    
    def add_status(status_name):
        history.append({
            "category": "directed_status",
            "type": status_name,
            "value": True,
            "first": character.full_name
        })
    
    add_status(character.occupation.vocation) if character.occupation else None
    add_status(character.occupation.level) if character.occupation else None
    
    ########## Export Occupation ##########
    
    # "occupationStartDate": character.occupation.start_date if character.occupation else None,
    # "occupationEndDate": character.occupation.end_date if character.occupation else None,
    # "occupationShift": character.occupation.shift if character.occupation else None,
    # "occupationCompany": character.occupation.company.id if character.occupation else None,
    # "occupationHiredAsFavor": character.occupation.hired_as_favor if character.occupation else None,
    # "occupationPositionPrecededBy": (
    #     character.occupation.preceded_by.person.id
    #     if character.occupation and character.occupation.preceded_by
    #     else None
    # ),
    # "occupationPositionSucceededBy": (
    #     character.occupation.succeeded_by.person.id
    #     if character.occupation and character.occupation.succeeded_by
    #     else None
    # ),
    # "allOccupations": [(job.vocation, job.company.id) for job in character.occupations],
    
    ########## Export Traits and Statuses ##########
    
    def add_trait(trait_name):
        history.append({
            "category": "trait",
            "type": trait_name,
            "value": True
        })
    
    add_trait("male") if character.male else add_trait("female")
    add_trait("infertile") if character.infertile else None
    add_trait("attracted_to_men") if character.attracted_to_men else None
    add_trait("attracted_to_women") if character.attracted_to_women else None
    add_trait("age") if character.age else None
    add_trait("alive") if character.alive else None
    add_trait("widowed") if character.widowed else None
    add_trait("pregnant") if character.pregnant else None
    add_trait("retired") if character.retired else None
    add_trait("collegeGraduate") if character.college_graduate else None
    add_trait("grieving") if character.grieving else None
    add_trait("currentlyWorking") if character.routine.working else None
    add_trait("currentLocationOccasion") if character.routine.occasion else None
    
all_places = (
    sim.city.companies | sim.city.former_companies | sim.city.dwelling_places | sim.city.former_dwelling_places
)

for place in sorted(all_places, key=lambda p: p.id):
    if place.type == "business":
        business = place
        business_data = {
            "id": business.id,
            "name": business.name,
            "business": True,
            "residence": False,
            "type": business.__class__.__name__,
            "founder": business.founder.person.id if business.founder else None,
            "founded": business.founded,
            "owner": business.owner.person.id if business.owner else None,
            "out of business": business.out_of_business,
            "house number": business.house_number,
            "lot": business.lot.id,
            "former owners": [former_owner.person.id for former_owner in business.former_owners],
            "closure year": business.closure.year if business.closure else None,
            "people here now": [character.id for character in business.people_here_now],
            "address": business.address,
            "services": business.services,
            "street": business.street_address_is_on.name,
            "employees": [employee.person.id for employee in business.employees],
            "former employees": [employee.person.id for employee in business.former_employees],
        }
        
        try:
            business_data.update({
                "construction year": business.construction.year if business.construction else None,
                "construction firm": (
                    business.construction.construction_firm.id
                    if business.construction and business.construction.construction_firm
                    else None
                ),
                "architect": (
                    business.construction.architect.person.id
                    if business.construction and business.construction.architect
                    else None
                ),
                "builders": [builder.id for builder in business.construction.builders] if business.construction else [],
                "building demolished to construct this": (
                    business.construction.demolition_that_preceded_this.building.id
                    if business.construction and business.construction.demolition_that_preceded_this
                    else None
                ),
            })
        except AttributeError:
            business_data["construction year"] = None
        
        try:
            business_data.update({
                "demolished": bool(business.demolition),
                "demolished year": business.demolition.year if business.demolition else None,
                "demolition company": (
                    business.demolition.demolition_company.id
                    if business.demolition and business.demolition.demolition_company
                    else None
                ),
            })
        except AttributeError:
            business_data["demolished"] = None
            
        places.append(business_data)
    else:
        residence = place
        residence_data = {
            "id": residence.id,
            "name": residence.name,
            "residence": True,
            "business": False,
            "is apartment": residence.apartment,
            "people here now": [character.id for character in residence.people_here_now],
            "former residents": [resident.id for resident in residence.former_residents],
            "house number": residence.house_number,
            "owners": [owner.id for owner in residence.owners],
            "lot": residence.lot.id,
            "address": residence.address,
            "residents": [resident.id for resident in residence.residents],
            "former owners": [resident.id for resident in residence.former_owners],
            "unit number": residence.unit_number if residence.apartment else None,
            "apartment complex": residence.complex.id if residence.apartment else None,
        }
        
        try:
            residence_data.update({
                "construction year": residence.construction.year if residence.construction else None,
                "construction firm": (
                    residence.construction.construction_firm.id
                    if residence.construction and residence.construction.construction_firm
                    else None
                ),
                "architect": (
                    residence.construction.architect.person.id
                    if residence.construction and residence.construction.architect
                    else None
                ),
                "builders": [builder.id for builder in residence.construction.builders] if residence.construction else [],
                "building demolished to construct this": (
                    business.construction.demolition_that_preceded_this.building.id
                    if business.construction and business.construction.demolition_that_preceded_this
                    else None
                )
            })
        except AttributeError:
            residence_data["construction year"] = None
        
        try:
            residence_data.update({
                "demolished": bool(residence.demolition),
                "demolished year": residence.demolition.year if residence.demolition else None,
                "demolition company": (
                    residence.demolition.demolition_company.id
                    if residence.demolition and residence.demolition.demolition_company
                    else None
                )
            })
        except AttributeError:
            residence_data["demolished"] = None
        
        places.append(residence_data)
        
for lot in sorted(sim.city.lots | sim.city.tracts, key=lambda l: l.id):
    lot_data = {
        "id": lot.id,
        "building": lot.building.id if lot.building else None,
        "former buildings": [building.id for building in lot.former_buildings],
        "street address is on": lot.street_address_is_on.name,
        "house number": lot.house_number,
        "neighboring lots": [neighboring_lot.id for neighboring_lot in lot.neighboring_lots],
        "adjoining streets": [street.name for street in lot.streets],
        "coordinates": lot.coordinates,
        "sides of street": lot.sides_of_street,
        "is tract": lot.tract,
        "address": lot.address,
    }
    lots.append(lot_data)
    

for event in sim.get_events():
    event_ensemble = event.ensemble()
    if event_ensemble is not None:
        if "type" in event_ensemble:
            if event_ensemble["type"] not in ["forgetting", "mutation", "implant", "confabulation"]:
                history.append(event_ensemble)
        else:
            print("Event with missing type: {}".format(event_ensemble))

# Sort data
places.sort(key=lambda p: p["id"])
lots.sort(key=lambda l: l["id"])

# Validate data
# for i, character_data in enumerate(cast):
#     assert character_data["id"] == i, "Mismatched character ID and index: ID is {id} and index is {i}".format(
#         id=character_data["id"],
#         i=i
#     )
# for i, place_data in enumerate(places):
#     assert place_data["id"] == i, "Mismatched place ID and index: ID is {id} and index is {i}".format(
#         id=place_data["id"],
#         i=i
#     )
# for i, lot_data in enumerate(lots):
#     assert lot_data["id"] == i, "Mismatched lot ID and index: ID is {id} and index is {i}".format(
#         id=residence_data["id"],
#         i=i
#     )

# Export History JSON
filename = "ensemble/history-{time}.json".format(time=int(time.time()))
with open(filename, 'w') as outfile:
    json_string = json.dumps(history, indent=4, sort_keys=True)
    outfile.write(json_string)
    
# Export Cast JSON
filename = "ensemble/cast-{time}.json".format(time=int(time.time()))
with open(filename, 'w') as outfile:
    json_string = json.dumps(cast, indent=4, sort_keys=True)
    outfile.write(json_string)
    
# Export Actions JSON
# filename = "ensemble/actions-{time}.json".format(time=int(time.time()))
# with open(filename, 'w') as outfile:
#     json_string = json.dumps(actions)
#     outfile.write(json_string)
    
# Export Places JSON
filename = "ensemble/places-{time}.json".format(time=int(time.time()))
with open(filename, 'w') as outfile:
    json_string = json.dumps(places, indent=4, sort_keys=True)
    outfile.write(json_string)
    
# Export Lots JSON
filename = "ensemble/lots-{time}.json".format(time=int(time.time()))
with open(filename, 'w') as outfile:
    json_string = json.dumps(lots, indent=4, sort_keys=True)
    outfile.write(json_string)
    
# Export Rules JSON
# filename = "ensemble/rules-{time}.json".format(time=int(time.time()))
# with open(filename, 'w') as outfile:
#     json_string = json.dumps(rules)
#     outfile.write(json_string)

# Export Schema JSON
# filename = "ensemble/schema-{time}.json".format(time=int(time.time()))
# with open(filename, 'w') as outfile:
#     json_string = json.dumps(schema)
#     outfile.write(json_string)